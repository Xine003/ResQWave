const { createClient } = require("@sanity/client");

// Initialize Sanity client
const sanityClient = createClient({
    projectId: process.env.SANITY_PROJECT_ID || "5u9e9skw",
    dataset: process.env.SANITY_DATASET || "production",
    apiVersion: "2024-01-01",
    useCdn: true, // Use CDN for faster reads
});

/**
 * Fetch all active chatbot content from Sanity and build the context string
 */
const buildChatbotContext = async () => {
    try {
        // Fetch all content types in parallel
        const [settings, distressSignals, generalQuestions, userGuidance, clarifications, safetyTips, contactInfo] =
            await Promise.all([
                // Chatbot Settings (singleton)
                sanityClient.fetch(`*[_type == "chatbotSettings"][0]{
                    systemName,
                    systemDescription,
                    contactEmail,
                    contactPhone,
                    supportHours,
                    emergencyContactInfo,
                    defaultLanguage,
                    maxResponseLength
                }`),

                // 1. Interpret Distress Signals
                sanityClient.fetch(`*[_type == "interpretDistressSignals" && isActive == true][0]{
                    title,
                    description,
                    keywords,
                    points[]{
                        point,
                        answer,
                        keywords
                    }
                }`),

                // 2. Handle General Questions
                sanityClient.fetch(`*[_type == "handleGeneralQuestions" && isActive == true][0]{
                    title,
                    description,
                    predefinedAnswers[]{
                        topic,
                        keywords,
                        answer,
                        userRoles
                    }
                }`),

                // 3. User Guidance
                sanityClient.fetch(`*[_type == "userGuidance" && isActive == true][0]{
                    title,
                    description,
                    note,
                    predefinedAnswers[]{
                        task,
                        answer,
                        roleInfo
                    }
                }`),

                // 4. Clarification Requests Fallback
                sanityClient.fetch(`*[_type == "clarificationRequestsFallback" && isActive == true][0]{
                    title,
                    description,
                    messages[]{
                        message
                    }
                }`),

                // 5. Safety Tips & Preparedness
                sanityClient.fetch(`*[_type == "safetyTipsPreparedness" && isActive == true][0]{
                    title,
                    description,
                    predefinedAnswers[]{
                        topic,
                        answer
                    }
                }`),

                // 6. Contact Information
                sanityClient.fetch(`*[_type == "contactInformation" && isActive == true][0]{
                    title,
                    description,
                    email,
                    phone,
                    supportHours,
                    exampleResponses
                }`),
            ]);

        // Build the context string dynamically
        let context = "";

        // System Introduction
        if (settings) {
            context += `You are ${settings.systemName}, ${settings.systemDescription}\n\n`;
        } else {
            context +=
                "You are ResQWave Assistant, an AI helper for ResQWave - a LoRa-powered emergency communication system.\n\n";
        }

        context += "Chatbot Capabilities:\n\n";

        // 1. Interpret Distress Signals
        if (distressSignals) {
            context += `1. ${distressSignals.title}\n`;
            context += `  - ${distressSignals.description}`;
            if (distressSignals.keywords && distressSignals.keywords.length > 0) {
                context += ` (keywords: ${distressSignals.keywords.join(", ")})`;
            }
            context += "\n";

            if (distressSignals.points && distressSignals.points.length > 0) {
                distressSignals.points.forEach((point) => {
                    context += `  - ${point.point}: ${point.answer}`;
                    if (point.keywords && point.keywords.length > 0) {
                        context += ` (keywords: ${point.keywords.join(", ")})`;
                    }
                    context += "\n";
                });
            }
            context += "\n";
        }

        // 2. Handle General Questions
        if (generalQuestions && generalQuestions.predefinedAnswers) {
            context += `2. ${generalQuestions.title}\n`;
            context += `  - ${generalQuestions.description}\n`;
            context += "  - Predefined answers for general questions:\n";

            generalQuestions.predefinedAnswers.forEach((qa) => {
                const keywordStr = qa.keywords.join(", ");
                context += `    * ${qa.topic} (keywords: ${keywordStr}): ${qa.answer} (${qa.userRoles})\n`;
            });
            context += "\n";
        }

        // 3. User Guidance
        if (userGuidance && userGuidance.predefinedAnswers) {
            context += `3. ${userGuidance.title}\n`;
            context += `  - ${userGuidance.description}\n`;
            if (userGuidance.note) {
                context += `  - ${userGuidance.note}\n`;
            }
            context += "  - Predefined answers for user guidance:\n";

            userGuidance.predefinedAnswers.forEach((guide) => {
                context += `    * ${guide.task}: ${guide.answer} (${guide.roleInfo})\n`;
            });
            context += "\n";
        }

        // 4. Clarification Requests Fallback
        if (clarifications && clarifications.messages) {
            context += `4. ${clarifications.title} (${clarifications.description}):\n`;
            clarifications.messages.forEach((msg) => {
                context += `  * "${msg.message}"\n`;
            });
            context += "\n";
        }

        // 5. Safety Tips & Preparedness Guidance
        if (safetyTips && safetyTips.predefinedAnswers) {
            context += `5. ${safetyTips.title}\n`;
            context += `  - ${safetyTips.description}\n`;
            context += "  - Predefined answers for safety and preparedness:\n";

            safetyTips.predefinedAnswers.forEach((tip) => {
                context += `    * ${tip.topic}: ${tip.answer}\n`;
            });
            context += "\n";
        }

        // 6. Contact Information
        if (contactInfo) {
            context += `6. ${contactInfo.title}\n`;
            context += `  - ${contactInfo.description}\n`;
            context += `    * Email: ${contactInfo.email}\n`;
            if (contactInfo.phone) {
                context += `    * Phone: ${contactInfo.phone}\n`;
            }
            if (contactInfo.supportHours) {
                context += `    * Support Hours: ${contactInfo.supportHours}\n`;
            }
            if (contactInfo.exampleResponses && contactInfo.exampleResponses.length > 0) {
                context += `  - Example responses:\n`;
                contactInfo.exampleResponses.forEach((example) => {
                    const responseText = example.response || example;
                    context += `    * "${responseText.replace('[email]', contactInfo.email)}"\n`;
                });
            }
        }

        return context;
    } catch (error) {
        console.error("Error building chatbot context from Sanity:", error);
        // Return a minimal fallback context
        return "You are ResQWave Assistant. Please try again or contact support at resqwaveinfo@gmail.com";
    }
};

/**
 * Get chatbot settings (for welcome message, max response length, etc.)
 */
const getChatbotSettings = async () => {
    try {
        const settings = await sanityClient.fetch(`*[_type == "chatbotSettings"][0]{
            systemName,
            welcomeMessage,
            contactEmail,
            defaultLanguage,
            maxResponseLength,
            quickActionCount,
            isMaintenanceMode,
            maintenanceMessage
        }`);
        return settings;
    } catch (error) {
        console.error("Error fetching chatbot settings:", error);
        return null;
    }
};

/**
 * Get random clarification messages
 */
const getClarificationMessages = async (count = 3) => {
    try {
        const messages = await sanityClient.fetch(
            `*[_type == "clarificationMessage" && isActive == true] | order(_createdAt desc)[0...${count}]{
                message
            }`
        );
        return messages.map((m) => m.message);
    } catch (error) {
        console.error("Error fetching clarification messages:", error);
        return [
            "I didn't quite catch that. Could you please clarify your question?",
            "Can you rephrase or provide more details?",
            "I'm not sure I understand. Would you like to know about ResQWave's features?",
        ];
    }
};

module.exports = {
    buildChatbotContext,
    getChatbotSettings,
    getClarificationMessages,
    sanityClient,
};
