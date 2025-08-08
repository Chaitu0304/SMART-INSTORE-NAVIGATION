# Smart Mart - Advanced GPS-Style Navigation System

A sophisticated shopping navigation application that provides Google Maps-like navigation experience for in-store shopping with advanced features like live rerouting, realistic voice prompts, and custom themes.

## 🚀 Features

### 🗺️ Advanced GPS-Style Navigation
- **SVG-based Map Rendering**: Professional vector graphics for crisp, scalable maps
- **Live Rerouting**: Automatic route optimization based on traffic conditions
- **Custom Themes**: Multiple map themes (Default, Dark, Satellite, Minimal)
- **Zoom & Pan Controls**: Intuitive map navigation with smooth transitions
- **Animated Navigation Arrow**: Real-time position tracking with direction indicators
- **Destination Pins**: Clear visual markers for shopping destinations

### 🎤 Advanced Voice Assistant
- **Realistic GPS Voice Prompts**: Natural-sounding navigation instructions
- **Voice Recognition**: Listen for voice commands ("stop", "repeat", "traffic", "distance", "eta")
- **Traffic Alerts**: Real-time congestion notifications with voice announcements
- **Smart Product Suggestions**: Contextual recommendations with voice feedback
- **Customizable Voice Settings**: Adjustable speed, pitch, and volume
- **Voice History**: Track recent voice commands and interactions

### 🚦 Traffic Monitoring System
- **Real-time Congestion Tracking**: Monitor aisle traffic conditions
- **Traffic Alerts**: Automatic notifications for heavy congestion
- **Congestion Level Indicators**: Visual progress bars showing traffic density
- **Alternative Route Suggestions**: Smart rerouting based on traffic conditions
- **Traffic Statistics**: Historical data and alert tracking

### 🎯 Navigation Overlay
- **Turn-by-Turn Instructions**: GPS-style navigation guidance
- **ETA & Distance Tracking**: Real-time arrival estimates
- **Progress Visualization**: Visual progress indicators
- **Manual Navigation Controls**: Step-by-step navigation controls
- **Current Position Display**: Real-time location tracking

### 🎨 Customizable Interface
- **Multiple Map Themes**: Choose from 4 different visual themes
- **Advanced Feature Toggle**: Enable/disable advanced features
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Professional UI**: Modern, clean interface with smooth animations

## 🛠️ Technical Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Styling**: Tailwind CSS for responsive design
- **Icons**: Lucide React for consistent iconography
- **Voice**: Web Speech API for text-to-speech and speech recognition
- **Maps**: Custom SVG-based map rendering system

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project directory
cd smart-mart

# Install dependencies
npm install

# Start the development server
npm run dev
```

### Usage
1. **Add Items to Shopping List**: Navigate to the shopping list page and add products
2. **Start Navigation**: Go to the store map and click "Start Navigation"
3. **Follow GPS Guidance**: Use the voice assistant and visual cues to navigate
4. **Customize Experience**: Adjust map themes and voice settings as needed

## 🎯 Advanced Features

### Live Rerouting
The system automatically detects traffic conditions and suggests alternative routes:
- Real-time traffic monitoring
- Automatic route recalculation
- Voice notifications for route changes
- Visual indicators for congestion

### Voice Commands
Interact with the system using natural voice commands:
- "Stop" - Pause voice guidance
- "Repeat" - Replay current instruction
- "Traffic" - Get current traffic conditions
- "Distance" - Hear remaining distance
- "ETA" - Get estimated time of arrival

### Custom Themes
Choose from multiple map themes:
- **Default**: Clean, professional look
- **Dark**: Low-light optimized theme
- **Satellite**: High-contrast theme
- **Minimal**: Simplified, distraction-free view

### Traffic Monitoring
Advanced traffic detection system:
- Real-time congestion tracking
- Automatic alert generation
- Historical traffic data
- Smart rerouting suggestions

## 🎨 UI Components

### AdvancedMartMap
- SVG-based map rendering
- Zoom, pan, and rotation controls
- Animated navigation arrows
- Custom theme support
- Live rerouting capabilities

### AdvancedVoiceAssistant
- Realistic GPS voice prompts
- Voice recognition integration
- Traffic alert system
- Customizable voice settings
- Smart product suggestions

### NavigationOverlay
- Turn-by-turn instructions
- ETA and distance tracking
- Progress visualization
- Manual navigation controls

### TrafficMonitor
- Real-time congestion tracking
- Traffic alert system
- Congestion level indicators
- Traffic statistics

## 🔧 Configuration

### Voice Settings
Adjust voice assistant parameters:
```typescript
const voiceSettings = {
  rate: 0.9,      // Speech rate (0.5-2.0)
  pitch: 1.1,     // Voice pitch (0.5-2.0)
  volume: 0.8,    // Volume level (0-1)
  voice: 'en-US'  // Language setting
}
```

### Map Themes
Customize map appearance:
```typescript
const themes = {
  default: { /* Professional theme */ },
  dark: { /* Dark mode theme */ },
  satellite: { /* High contrast theme */ },
  minimal: { /* Simplified theme */ }
}
```

## 🚀 Performance Features

- **Optimized SVG Rendering**: Efficient vector graphics
- **Smooth Animations**: 60fps transitions and animations
- **Responsive Design**: Works on all screen sizes
- **Voice Optimization**: Efficient speech synthesis
- **Memory Management**: Proper cleanup and resource management

## 🎯 Future Enhancements

- **AR Navigation**: Augmented reality overlay
- **Beacon Integration**: Indoor positioning system
- **Machine Learning**: Smart route optimization
- **Social Features**: Share routes with friends
- **Offline Support**: Download maps for offline use
- **Multi-language**: International voice support

## 📱 Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Google Maps for navigation inspiration
- Web Speech API for voice features
- Lucide for beautiful icons
- Tailwind CSS for styling framework 