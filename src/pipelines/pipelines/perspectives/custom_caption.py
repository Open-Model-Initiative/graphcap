from graphcap.perspectives.perspective_library import CustomCaptionProcessor
from graphcap.perspectives.perspective_library.custom_caption.types import (
    CustomCaptionDefinition,
)

art_style_definition = CustomCaptionDefinition(
    name="art_style",
    instruction="Describe the artistic styles and techniques used in the image. "
    "What are the inspirations and genres of the artist? "
    "What is the mood of the image? "
    "What is the message of the image?",
)

ART_STYLE = CustomCaptionProcessor(art_style_definition)


