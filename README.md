# JavaScript Notebook

An interactive JavaScript notebook built with Electron and React. Write, execute, and experiment with JavaScript code in a browser-like environment with persistent variable scope across code blocks.

## Features

- **Interactive Code Blocks**: Write and execute JavaScript code in multiple blocks
- **Shared Variable Scope**: Variables declared in one block are available in subsequent blocks
- **Real-time Output**: See execution results and errors immediately
- **Multiple Execution Options**: Run individual blocks or all blocks at once
- **Clean Interface**: Dark theme with syntax highlighting
- **Error Handling**: Clear error messages with stack traces

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/js-notebook.git
   cd js-notebook
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

## Usage

### Basic Operations

- **Add a new code block**: Click the "Add Code Block" button at the bottom
- **Execute a block**: Click the "Run" button on any code block
- **Execute all blocks**: Click the "Run All" button in the header
- **Delete a block**: Click the delete button on any block (except the last one)
- **Clear all outputs**: Click "Clear Outputs" to reset all execution results

### Code Execution

- Write JavaScript code in the text areas
- The last expression in each block is returned as output
- Variables declared with `const`, `let`, or `var` are shared across blocks
- Use `console.log()` for debugging output

### Example Workflow

```javascript
// Block 1
const name = "World";
const greeting = "Hello, ";

// Block 2
const fullGreeting = greeting + name;
fullGreeting;  // Output: "Hello, World"

// Block 3
const result = fullGreeting.toUpperCase();
result;  // Output: "HELLO, WORLD"
```

## Technical Details

### Architecture

- **Frontend**: React 18 with functional components and hooks
- **Styling**: Tailwind CSS for responsive design
- **Execution Engine**: Browser-based JavaScript evaluation with shared scope
- **Desktop App**: Electron framework for cross-platform support

### Key Components

- **Code Blocks**: Individual executable units with their own state
- **Shared Scope**: Global variable storage that persists across blocks
- **Execution Context**: Sandboxed environment for safe code execution
- **Output Display**: Formatted display of execution results and errors

### Security Notes

- The application uses `eval()` for code execution, which has security implications
- Only run trusted code in this environment
- The application runs in a browser context with Electron's security features

## Development

### Running in Development Mode

```bash
npm start
```

### Building for Production

To create a distributable version:

```bash
npm run build  # If you add a build script
```

### Project Structure

```
js-notebook/
├── app.js          # Main React application
├── index.html      # HTML entry point
├── main.js         # Electron main process
├── package.json    # Project configuration
├── .gitignore      # Git ignore rules
└── README.md        # This file
```

## Troubleshooting

### Common Issues

**Electron fails to start**:
- Make sure you have Node.js and npm installed
- Run `npm install` to ensure all dependencies are installed
- Check for any error messages in the console

**Code execution errors**:
- Check your JavaScript syntax
- Ensure variables are properly declared
- Look at the error messages in the output section

**UI not displaying correctly**:
- Make sure Tailwind CSS is loaded properly
- Check browser console for any CSS-related errors

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgements

- Built with [Electron](https://www.electronjs.org/)
- Powered by [React](https://reactjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)

## Contact

For questions or support, please open an issue on the GitHub repository.

---

**Happy Coding!** 🚀