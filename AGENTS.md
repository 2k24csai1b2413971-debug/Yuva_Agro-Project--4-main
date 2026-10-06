# Yuva Agro Development Rules

## Existing Architecture

This is an existing Yuva Agro project.s

The current stack is:

- Static HTML
- CSS
- Vanilla JavaScript
- Express.js backend
- MongoDB
- Mongoose

Do NOT migrate the project to React, Vue, Next.js, or another framework.

## Existing Frontend

Reuse the existing:

- HTML structure
- styles.css
- script.js
- existing components
- existing CSS classes
- existing navigation

Do not redesign existing pages unless explicitly requested.

## Existing Backend

Keep the existing Express.js architecture.

Follow the existing pattern:

routes → controllers → models

Do not rewrite the existing farmer API.

## AI Features

We are adding two features:

1. Crop Disease Detection
2. AI Farmer Chatbot with regional language support

These must be integrated into the existing application.

Do not create a separate application.

## Crop Disease Detection

The existing disease-detection.html page already contains:

- image upload
- image preview
- analyze button
- result card

The current analysis is simulated.

Replace the simulation with a real AI-powered backend flow.

Reuse the existing UI.

## AI Farmer Chatbot

Add an agriculture-focused chatbot to the existing application.

Initially support:

- English
- Hindi

The chatbot should use the existing Express backend.

## Security

Never expose API keys in frontend JavaScript.

API keys must remain in backend environment variables.

Never commit .env files.

## Development Rules

Before modifying code:

1. Inspect the relevant existing files.
2. Understand the existing implementation.
3. Explain the proposed changes.
4. Identify files that will be created or modified.

Do not modify unrelated functionality.

After implementation:

1. List every file changed.
2. Explain what changed.
3. Explain the data flow.
4. Explain how to test the feature.
5. Explain important concepts used.