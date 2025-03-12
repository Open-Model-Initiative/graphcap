===========================
Perspectives in GraphCap
===========================

Think of a perspective as a unique way of looking at and describing an image. Just like how a photographer, an art critic, and a child might describe the same photograph differently, GraphCap uses different perspectives to capture various aspects of what makes an image meaningful.

What's in a Perspective?
=======================

At its core, a perspective is about asking specific questions about an image. For example:

- What objects and relationships can we see? (Graph Caption)
- How does the composition work? (Art Critic)
- What feelings does it evoke? (Emotional Sentiment)
- What story does it tell? (Temporarium)

Each perspective has its own:
- Focus (what it looks for)
- Language (how it describes things)
- Structure (how it organizes information)
- Balance between describing what's visible and what it means

Built-in Perspectives
===================

Graph Caption
------------
The "just the facts" perspective. It looks at what's actually in the image:
- Objects and their relationships
- Clear, verifiable descriptions
- Confidence scores for each observation
- Both quick summaries and detailed breakdowns

Example output:
"A brown dog sitting next to a red ball on green grass" (with confidence scores and relationship mapping)

Art Critic
---------
The formal analysis perspective. It examines:
- Composition and framing
- Color relationships
- Technical execution
- Artistic choices

Example output:
"Strong diagonal composition with warm earth tones, emphasizing texture through shallow depth of field"

Emotional Sentiment
-----------------
The feeling-focused perspective. It considers:
- Mood and atmosphere
- Emotional impact
- Human elements
- Psychological aspects

Example output:
"A serene moment capturing the quiet joy of a peaceful afternoon"

Temporarium
----------
A temporal contextperspective. It explores:
- Historical or cultural context
- Potential narratives
- Broader implications
- Time-based elements

Example output:
"A snapshot of urban life in transition, where modern architecture meets historical preservation"

Creating Your Own Perspective
===========================

Before You Start
--------------
Ask yourself:
- What unique angle are you trying to capture?
- Who will use this perspective and why?
- How literal vs. interpretative should it be?
- What kind of output will be most useful?

How to create a perspective
--------------------------

Define a config file for the perspective. Following these examples: 


   .. code-block:: json
        {
        "name": "graph_caption",
        "display_name": "Graph Caption",
        "version": "1",
        "prompt": "Analyze this image and provide a structured analysis with the following components:\n\n1. Tags: Generate a list of categorized tags with confidence scores for key elements in the image. Each tag should include the tag name, category, and a confidence score between 0 and 1.\n\n2. Short Caption: Create a concise single-sentence caption (max 100 characters) that summarizes the main content of the image.\n\n3. Verification: Provide a brief verification of the tag accuracy and visual grounding, noting any potential issues or uncertainties.\n\n4. Dense Caption: Create a detailed narrative description that incorporates the tagged elements and provides a comprehensive understanding of the image content.\n\nYour analysis should be objective, detailed, and based solely on what is visible in the image.",
        "schema_fields": [
            {
            "name": "tags_list",
            "type": "str",
            "description": "List of categorized tags with confidence scores",
            "is_list": true,
            "is_complex": true,
            "fields": [
                {
                "name": "tag",
                "type": "str",
                "description": "Description of the tagged element"
                },
                {
                "name": "category",
                "type": "str",
                "description": "Category the tag belongs to"
                },
                {
                "name": "confidence",
                "type": "float",
                "description": "Confidence score between 0 and 1"
                }
            ]
            },
            {
            "name": "short_caption",
            "type": "str",
            "description": "Concise single sentence caption (max 100 chars)",
            "is_list": false
            },
            {
            "name": "verification",
            "type": "str",
            "description": "Verification of tag accuracy and visual grounding",
            "is_list": false
            },
            {
            "name": "dense_caption",
            "type": "str",
            "description": "Detailed narrative description incorporating tagged elements",
            "is_list": false
            }
        ],
        "table_columns": [
            {
            "name": "Category",
            "style": "cyan"
            },
            {
            "name": "Content",
            "style": "green"
            }
        ],
        "context_template": "<GraphCaption>\n{short_caption}\n\nTags: {tags_list}\n</GraphCaption>\n"
        } 

    .. code-block:: json
            {
        "name": "temporarium",
        "display_name": "Temporarium",
        "version": "1",
        "prompt": "You are a temporal analysis agent. Analyze this image with a focus on time-related aspects and temporal dimensions. Your response should include a chain-of-thought reasoning process with the following components:\n\n1. Visual Analysis: Provide observations based solely on visible image details.\n\n2. Epoch Reasoning: Present logical reasoning about the implied historical or futuristic epoch.\n\n3. Epoch Context: Provide a concise summary of the inferred epoch context.\n\n4. Narrative Reasoning: Explain how key elements fit within the epoch context.\n\n5. Narrative Elements: Provide a factual description of key visible subjects or objects, linked to the epoch.\n\n6. Continuity Reasoning: Reason on how the scene connects to known historical trends or plausible futures.\n\n7. Continuity Elements: Provide a brief summary of historical or futuristic continuity.\n\n8. Speculative Reasoning: Present step-by-step reasoning behind any imaginative extrapolation.\n\n9. Temporal Speculation: Provide imaginative yet plausible speculative details derived from reasoning.\n\n10. Detailed Caption: Create a final cohesive caption integrating all chain-of-thought steps.\n\nYour analysis should be thoughtful and consider both explicit and implicit temporal elements in the image.",
        "schema_fields": [
            {
            "name": "visual_analysis",
            "type": "str",
            "description": "Observations based solely on visible image details.",
            "is_list": false
            },
            {
            "name": "epoch_reasoning",
            "type": "str",
            "description": "Logical reasoning about the implied historical or futuristic epoch.",
            "is_list": false
            },
            {
            "name": "epoch_context",
            "type": "str",
            "description": "Concise summary of the inferred epoch context.",
            "is_list": false
            },
            {
            "name": "narrative_reasoning",
            "type": "str",
            "description": "Explanation of how key elements fit within the epoch context.",
            "is_list": false
            },
            {
            "name": "narrative_elements",
            "type": "str",
            "description": "Factual description of key visible subjects or objects, linked to the epoch.",
            "is_list": false
            },
            {
            "name": "continuity_reasoning",
            "type": "str",
            "description": "Reasoning on how the scene connects to known historical trends or plausible futures.",
            "is_list": false
            },
            {
            "name": "continuity_elements",
            "type": "str",
            "description": "Brief summary of historical or futuristic continuity.",
            "is_list": false
            },
            {
            "name": "speculative_reasoning",
            "type": "str",
            "description": "Step-by-step reasoning behind any imaginative extrapolation.",
            "is_list": false
            },
            {
            "name": "temporal_speculation",
            "type": "str",
            "description": "Imaginative yet plausible speculative details derived from reasoning.",
            "is_list": false
            },
            {
            "name": "detailed_caption",
            "type": "str",
            "description": "Final cohesive caption integrating all chain-of-thought steps.",
            "is_list": false
            }
        ],
        "table_columns": [
            {
            "name": "Component",
            "style": "cyan"
            },
            {
            "name": "Content",
            "style": "green"
            }
        ],
        "context_template": "<TemporariumCaption>\n{detailed_caption}\n</TemporariumCaption>\n"
        } 

Tips for Good Perspectives
========================

Keep It Focused
-------------
- Pick one main thing to analyze well
- Don't try to do everything
- Be clear about what the perspective is and isn't for

Example: A "street_scene" perspective might focus on urban design elements, but leave artistic analysis to the art critic perspective.

Quality Matters
-------------
- Test with diverse images
- Check if outputs are useful
- Get feedback from potential users
- Have clear ways to measure success

Make It Useful
------------
- Write clear documentation
- Include examples
- Make it easy to understand when to use this perspective
- Consider how it fits with other perspectives

Real-World Usage
==============

Perspectives work best when they complement each other. You might use:

- Graph Caption + Art Critic for detailed artwork analysis
- Emotional Sentiment + Temporarium for storytelling
- Multiple perspectives for training data generation

Remember: The goal isn't to replace human understanding, but to provide useful, structured ways of describing and analyzing images for different purposes.
