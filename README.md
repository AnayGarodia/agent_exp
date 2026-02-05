# Dorian AI Agent Builder

Dorian is a powerful tool for building AI agents with a visual workflow editor. It provides a user-friendly interface to design, build, and deploy AI agents that can integrate with various services.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm installed on your machine.

- [Node.js](https://nodejs.org/)
- [npm](https://www.npmjs.com/get-npm)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/your_username_/Project-Name.git
   ```
2. Install NPM packages for the server
   ```sh
   cd dorian/server
   npm install
   ```
3. Install NPM packages for the client
   ```sh
   cd ../client
   npm install
   ```

### Running the application

1. Start the backend server
   ```sh
   cd dorian/server
   npm start
   ```
2. Start the frontend development server
   ```sh
   cd dorian/client
   npm start
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Available Scripts

In the project directory, you can run:

### `npm start` (Client)

Runs the app in the development mode.<br>
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br>
You will also see any lint errors in the console.

### `npm test` (Client)

Launches the test runner in the interactive watch mode.<br>
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build` (Client)

Builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br>
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm start` (Server)

Starts the backend server.

### `npm run dev` (Server)

Starts the backend server in development mode using nodemon.2
