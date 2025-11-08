from typing import TypedDict, List, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from app.models import SubtitleSegment, StyleConfig
from app.config import settings
from app.repositories import storage_repo
from app.prompts import (
    INTENT_DETECTION_PROMPT,
    SUBTITLE_GENERATION_PROMPT,
    STYLE_MODIFICATION_PROMPT,
    CONTENT_MODIFICATION_PROMPT,
)
import json
import re
import os

class VideoEditState(TypedDict):
    """State for LangGraph workflow"""
    session_id: int
    user_message: str
    intent: str
    subtitles: List[SubtitleSegment]
    style: StyleConfig
    previous_edits: List[dict]
    ai_response: str
    video_path: str

class LLMService:
    """Service for LLM-based operations using LangGraph"""
    
    def __init__(self):
        # Set environment variable for OpenAI
        os.environ["OPENAI_API_KEY"] = settings.openai_api_key
        
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.7
        )
        self.graph = self._build_graph()
    
    def _build_graph(self) -> StateGraph:
        """Build LangGraph workflow"""
        workflow = StateGraph(VideoEditState)
        
        # Add nodes
        workflow.add_node("understand_intent", self._understand_intent)
        workflow.add_node("generate_subtitles", self._generate_subtitles)
        workflow.add_node("transcribe_audio", self._transcribe_audio)
        workflow.add_node("modify_style", self._modify_style)
        workflow.add_node("modify_content", self._modify_content)
        workflow.add_node("format_response", self._format_response)
        
        # Define edges
        workflow.set_entry_point("understand_intent")
        
        workflow.add_conditional_edges(
            "understand_intent",
            self._route_intent,
            {
                "add_subtitles": "generate_subtitles",
                "transcribe_audio": "transcribe_audio",
                "modify_style": "modify_style",
                "modify_content": "modify_content"
            }
        )
        
        workflow.add_edge("generate_subtitles", "format_response")
        workflow.add_edge("transcribe_audio", "format_response")
        workflow.add_edge("modify_style", "format_response")
        workflow.add_edge("modify_content", "format_response")
        workflow.add_edge("format_response", END)
        
        return workflow.compile()
    
    def _understand_intent(self, state: VideoEditState) -> VideoEditState:
        """Analyze user message to understand intent"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", INTENT_DETECTION_PROMPT),
            ("user", "{message}")
        ])
        
        response = self.llm.invoke(prompt.format_messages(message=state["user_message"]))
        intent = response.content.strip().lower()
        
        # Ensure valid intent
        valid_intents = ["transcribe_audio", "add_subtitles", "modify_style", "modify_content"]
        if intent not in valid_intents:
            intent = "add_subtitles"  # Default
        
        state["intent"] = intent
        return state
    
    def _generate_subtitles(self, state: VideoEditState) -> VideoEditState:
        """Generate subtitle segments from user input"""
        prompt = ChatPromptTemplate.from_messages([
            ("system", SUBTITLE_GENERATION_PROMPT),
            ("user", "{message}")
        ])
        
        response = self.llm.invoke(prompt.format_messages(message=state["user_message"]))
        
        # Parse subtitles
        try:
            content = response.content.strip()
            
            # Remove markdown code blocks if present
            content = re.sub(r'\s*|\s*```', '', content).strip()
            
            # Extract JSON array if wrapped in other text
            json_match = re.search(r'\[\s*\{.*?\}\s*\]', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            
            subtitles_data = json.loads(content)
            
            # Validate it's a list
            if not isinstance(subtitles_data, list):
                raise ValueError("Not a list")
            
            # Validate each subtitle has required fields
            validated_subtitles = []
            for sub in subtitles_data:
                if isinstance(sub, dict) and 'start' in sub and 'end' in sub and 'text' in sub:
                    validated_subtitles.append(SubtitleSegment(**sub))
            
            if not validated_subtitles:
                raise ValueError("No valid subtitles found")
            
            state["subtitles"] = validated_subtitles
            
        except Exception as e:
            # Fallback
            state["subtitles"] = [
                SubtitleSegment(start=0.0, end=5.0, text="Sample subtitle")
            ]
        
        # Set default style if not present or get from previous edits
        if not state.get("style"):
            if state.get("previous_edits") and len(state["previous_edits"]) > 0:
                last_edit = state["previous_edits"][-1]
                state["style"] = StyleConfig(**last_edit["style"])
            else:
                state["style"] = StyleConfig()
        
        return state
    
    def _transcribe_audio(self, state: VideoEditState) -> VideoEditState:
        """Transcribe audio from video using Whisper API"""
        from .transcription_service import transcription_service
        
        try:
            # Get video path from session
            video_path = state.get("video_path", "")
            
            if not video_path:
                raise ValueError("Video path not provided")
            
            # Generate subtitles from audio
            subtitles = transcription_service.generate_subtitles_from_video(video_path)
            state["subtitles"] = subtitles
            
            # Set default style
            if not state.get("style"):
                if state.get("previous_edits") and len(state["previous_edits"]) > 0:
                    last_edit = state["previous_edits"][-1]
                    state["style"] = StyleConfig(**last_edit["style"])
                else:
                    state["style"] = StyleConfig()
            
        except Exception as e:
            # Fallback
            state["subtitles"] = [
                SubtitleSegment(start=0.0, end=5.0, text="Transcription failed")
            ]
            state["style"] = StyleConfig()
        
        return state
    
    def _modify_style(self, state: VideoEditState) -> VideoEditState:
        """Modify subtitle styling based on user input"""
        # Get current style from previous edits or default
        if state.get("previous_edits") and len(state["previous_edits"]) > 0:
            last_edit = state["previous_edits"][-1]
            current_style = StyleConfig(**last_edit["style"])
            current_subtitles = last_edit["subtitles"]
        else:
            current_style = StyleConfig()
            current_subtitles = []
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", STYLE_MODIFICATION_PROMPT),
            ("user", "{message}")
        ])
        
        response = self.llm.invoke(prompt.format_messages(
            message=state["user_message"],
            font_family=current_style.font_family,
            font_size=current_style.font_size,
            font_color=current_style.font_color,
            background_color=current_style.background_color,
            position=current_style.position,
            outline_color=current_style.outline_color,
            outline_width=current_style.outline_width,
            margin_vertical=current_style.margin_vertical,
            margin_horizontal=current_style.margin_horizontal
        ))
        
        try:
            content = response.content.strip()
            # Remove markdown code blocks if present
            content = re.sub(r'\s*|\s*```', '', content)
            # Extract JSON object if wrapped in other text
            json_match = re.search(r'\{.*?\}', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            
            style_data = json.loads(content)
            state["style"] = StyleConfig(**style_data)
        except Exception as e:
            state["style"] = current_style
        
        # Keep existing subtitles
        state["subtitles"] = [SubtitleSegment(**s) for s in current_subtitles]
        
        return state
    
    def _modify_content(self, state: VideoEditState) -> VideoEditState:
        """Modify existing subtitle content"""
        if state.get("previous_edits") and len(state["previous_edits"]) > 0:
            last_edit = state["previous_edits"][-1]
            current_subtitles = last_edit["subtitles"]
            current_style = StyleConfig(**last_edit["style"])
        else:
            current_subtitles = []
            current_style = StyleConfig()
        
        prompt = ChatPromptTemplate.from_messages([
            ("system", CONTENT_MODIFICATION_PROMPT),
            ("user", "{message}")
        ])
        
        response = self.llm.invoke(prompt.format_messages(
            message=state["user_message"],
            current_subtitles=json.dumps(current_subtitles, indent=2)
        ))
        
        try:
            content = response.content.strip()
            # Remove markdown code blocks if present
            content = re.sub(r'\s*|\s*```', '', content)
            json_match = re.search(r'\[.*?\]', content, re.DOTALL)
            if json_match:
                content = json_match.group(0)
            
            subtitles_data = json.loads(content)
            state["subtitles"] = [SubtitleSegment(**sub) for sub in subtitles_data]
        except Exception as e:
            state["subtitles"] = [SubtitleSegment(**s) for s in current_subtitles]
        
        state["style"] = current_style
        
        return state
    
    def _format_response(self, state: VideoEditState) -> VideoEditState:
        """Format AI response to user"""
        if state["intent"] == "add_subtitles":
            count = len(state['subtitles'])
            state["ai_response"] = f"Added {count} subtitle{'s' if count != 1 else ''} to your video."
        elif state["intent"] == "transcribe_audio":
            count = len(state['subtitles'])
            state["ai_response"] = f"Generated {count} subtitle{'s' if count != 1 else ''} from your video audio using AI transcription."
        elif state["intent"] == "modify_style":
            style = state['style']
            parts = []
            
            # Font details
            parts.append(f"Font: {style.font_family} {style.font_size}px")
            
            # Color
            parts.append(f"Color: {style.font_color}")
            
            # Position (with margin if non-default)
            position_text = f"Position: {style.position.capitalize()}"
            if style.margin_vertical != 50:
                position_text += f" (Margin: {style.margin_vertical}px)"
            parts.append(position_text)
            
            # Background (only if not empty/transparent)
            if style.background_color and style.background_color not in ["", "#00000000", "transparent"]:
                parts.append(f"Background: {style.background_color}")
            
            # Outline (only if width > 0)
            if style.outline_width > 0:
                parts.append(f"Outline: {style.outline_width}px {style.outline_color}")
            
            state["ai_response"] = "Style updated:\n" + "\n".join(parts)
        else:
            state["ai_response"] = "Subtitles updated successfully!"
        
        return state
    
    def _route_intent(self, state: VideoEditState) -> str:
        """Route to appropriate node based on intent"""
        return state["intent"]
    
    async def process_message(
        self, 
        session_id: int, 
        message: str, 
        previous_edits: List[dict]
    ) -> dict:
        """Main entry point for processing user messages"""
        # Get video path from session
        session = storage_repo.get_session_by_id(session_id)
        video_path = session.video_path if session else ""
        
        initial_state = VideoEditState(
            session_id=session_id,
            user_message=message,
            intent="",
            subtitles=[],
            style=StyleConfig(),
            previous_edits=previous_edits,
            ai_response="",
            video_path=video_path
        )
        
        result = self.graph.invoke(initial_state)
        
        return {
            "response": result["ai_response"],
            "subtitles": result["subtitles"],
            "style": result["style"]
        }