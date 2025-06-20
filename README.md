# MedBuddy React Frontend

A modern React frontend for the MedBuddy medication reminder assistant.

## Demo
[Watch the demo here](https://www.canva.com/design/DAGq25rkCI0/EluzvxQ5DQzYYWRbVKDC2A/watch?utm_content=DAGq25rkCI0&utm_campaign=designshare&utm_medium=link2&utm_source=uniquelinks&utlId=h46abf15725)

## Features

- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Real-time Updates**: Live chat interface with MedBuddy
- **Smart Reminders**: Add and manage medication reminders
- **Collapsible Sections**: Organized view of active and completed reminders
- **Delete Functionality**: Remove completed reminders with smooth animations

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Development Server

```bash
npm start
```

The React app will start on `http://localhost:3000`

### 3. Make Sure Backend is Running

Ensure your FastAPI backend is running on `http://localhost:8000`:

```bash
uvicorn main:app --reload
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.js      # Main dashboard with reminders
│   ├── AddReminder.js    # Form to add new reminders
│   └── Chat.js          # Chat interface with MedBuddy
├── App.js               # Main app with routing
├── index.js             # React entry point
└── index.css            # Global styles with Tailwind
```

## Features

### Dashboard
- View all active and completed reminders
- Collapsible completed reminders section
- Delete completed reminders
- Refresh button to update data
- Status indicators for each reminder

### Add Reminder
- Simple form to add medication reminders
- Success/error messages
- Auto-clearing form after submission
- Time format examples
- Loading states

### Chat
- Real-time chat with MedBuddy
- Message history with timestamps
- Loading indicators
- Error handling
- Auto-scroll to latest messages

## API Integration

The React app communicates with your FastAPI backend through:

- `GET /reminders` - Fetch all reminders
- `POST /api/save_reminder` - Create new reminder
- `DELETE /reminders/{id}` - Delete reminder
- `POST /api/chat` - Send chat message

## Styling

- **Tailwind CSS** for utility-first styling
- **Lucide React** for beautiful icons
- **Responsive design** that works on all devices
- **Smooth animations** and transitions

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### Customization

- Modify `tailwind.config.js` for theme customization
- Update colors in `src/index.css`
- Add new components in `src/components/`

## Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Serve the `build` folder with your preferred web server

The React frontend provides a much more modern and responsive user experience compared to the Streamlit version! 
