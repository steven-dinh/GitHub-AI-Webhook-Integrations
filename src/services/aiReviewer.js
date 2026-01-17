const logger = require("../utils/logger");

class AIReviewer {
    constructor() {
        this.apiEndpoint = "https://api.anthropic.com/v1/messages";
        this.model = "claude-sonnet-4-20250514";
    }

    /**
     * Initiate file review.
     * @param {*} file
     * @param {*} analysis
     */
    async reviewCode(file, analysis) {
        try {
            logger.info("Generating Review", {
                file,
                analysis,
            });

            // Building Prompt
            let prompt = this.buildReviewPrompt(file, analysis);

            // Claude API
            const response = await fetch(this.apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    model: this.model,
                    max_tokens: 2000,
                    messages: [
                        {
                            role: "User",
                            content: prompt,
                        },
                    ],
                }),
            });

            // Handle Response
            const data = await response.json();

            if (!response.ok) {
                logger.error("Error generating review", response.statusText);
            }

            // Extract review from response
            const reviewText = data.content[0].text;

            logger.info("AI review generated", {
                filename: file.filename,
                reviewLength: reviewText.length,
            });

            return this.parseReview(reviewText);
        } catch (error) {
            logger.error("Error generating review", error.message);
        }
    }
}
