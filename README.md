# React Terminal Interface with Hono Backend

## Overview

This project provides a terminal-like interface built with React, utilizing a lightweight Hono backend to handle file operations and data processing. The application allows users to interact with a simulated command-line interface (CLI), performing operations such as fetching cryptocurrency prices, uploading and parsing CSV files, and dynamically generating charts.

## Design Choices

### Backend

- **Hono**: Chosen for its simplicity and lightweight nature, making it ideal for small-scale applications requiring high performance with minimal overhead.
- **csv-parser**: Used for efficiently reading and parsing CSV files, which supports the application's need to manipulate and visualize CSV data.

### Frontend

- **React**: Provides a robust framework for building interactive UIs. React's component-based architecture is used to manage the terminal's state and render updates efficiently.
- **Axios**: Utilized for making HTTP requests to the backend. Axios is preferred for its wide support and easy handling of requests and responses.
- **Recharts**: Selected for its React-friendly charting capabilities that integrate smoothly with the application to visualize data from CSV files.

#### Component Design

- **Field Component**: Acts as the core of the terminal interface, using react's Fragment to render the history of command outputs, thus simulating a terminal-like feel. The component uses React's `useState` hooks to manage the history of commands and display the output to the user. For complex commands like draw-chart, I have used regex to parse the input in a specified format. I have allowed only two columns to be included in the chart for better results.

## Architecture

The application is split into two main parts:

1. **Backend (Server)**: Handles API requests, file operations, and serves as the interface between the frontend and the filesystem.
2. **Frontend (Client)**: Provides the user interface, handles user input, used to make external API call and display responses from the server.

## How to Run the Code

### Prerequisites

- Node.js (v20.11.1) and npm installed (https://nodejs.org/)

### Setup and Installation

1. **Clone the repository**
2. **In the frontend and backend directory run:**
      ```bash
          npm install
      ```
      ```bash
          npm run dev
      ```
