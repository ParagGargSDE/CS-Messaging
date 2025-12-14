# Branch Customer Service Messaging Portal

A high-performance, real-time messaging dashboard designed for Branch customer service agents. This application allows multiple agents to manage customer inquiries, prioritizes messages based on urgency, and provides deep customer context.

## Features

*   **Multi-Agent System**: Switch between different agent profiles (Sarah, John, Ellen) to simulate a real team environment.
*   **Urgency Detection**: Heuristic-based scoring system automatically flags high-priority messages (e.g., loan rejections, fraud reports).
*   **Customer Context**: Detailed profile view for every customer, including loan balance, credit score, and risk tier.
*   **Real-time Simulation**: Built-in simulator to inject incoming messages from "customers" to test the queue flow.
*   **Canned Responses**: Quick-action chips for common inquiries to improve agent efficiency.
*   **Agent Attribution**: Outbound messages are tagged with the specific agent's profile for accountability.

## Prerequisites

To run this project locally, you need **Node.js** installed on your machine.

1.  **Check if Node is installed**:
    Open your terminal or command prompt and type:
    ```bash
    node -v
    ```
    If you see a version number (e.g., `v18.x.x` or higher), you are set.

2.  **Install Node.js (if missing)**:
    *   Download and install the LTS version from [nodejs.org](https://nodejs.org/).

## Installation & Setup

Follow these steps to set up the project on your local machine:

1.  **Navigate to the project folder**:
    Open your terminal and navigate to the directory where you saved these files.

2.  **Install Dependencies**:
    Run the following command to download the necessary libraries (React, Vite, Lucide Icons, etc.):
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the Development Server**:
    Run the following command:
    ```bash
    npm run dev
    ```

2.  **Open in Browser**:
    The terminal will show a local URL (usually `http://localhost:5173/`).
    *   Ctrl+Click the link or copy-paste it into your web browser.

## Usage Guide

1.  **Switching Agents**: Click the avatar in the top-right corner to switch between different agent profiles (e.g., from "Sarah" to "John").
2.  **Responding**: Select a message from the inbox on the left. Type a reply or select a "Canned Response" chip above the input bar.
3.  **Simulating Traffic**: Click the **"+ Sim"** button in the inbox header to simulate a new incoming message from a customer.
4.  **Viewing Profiles**: Click "View Profile" in the user dropdown to see agent stats, or look at the right-hand panel for Customer details.

## Tech Stack

*   **Frontend**: React 19, TypeScript
*   **Styling**: Tailwind CSS
*   **Icons**: Lucide React
*   **Build Tool**: Vite

