
## 📁 File Structure

```
Visualization/
├── index.tsx                    # Main visualization component
├── components/                  # UI Components
│   ├── LiveReportSidebar.tsx   # Sidebar for unassigned/waitlisted alerts
│   ├── MapControls.tsx         # Map control buttons (zoom, layers, live report toggle)
│   └── SignalPopover.tsx       # Popup showing detailed signal information
├── hooks/                      # Custom React hooks
│   └── useSignals.ts          # Hook for managing signal state and data
├── types/                      # TypeScript type definitions
│   ├── controls.ts            # Types for map controls
│   ├── popup.ts              # Types for popup/popover components
│   └── signals.ts            # Types for signal data and visualization state
└── utils/                     # Utility functions
    ├── flyingEffects.ts      # Map animation and camera movement utilities
    └── mapHelpers.tsx        # Map layer management and pin styling utilities
```


**Key Features**:
- Mapbox GL JS integration with interactive map rendering
- Signal boundary display with color-coded alerts (CRITICAL=red, USER-INITIATED=yellow, ONLINE=green, OFFLINE=gray)
- Real-time map updates and camera animations
- Event handling for pin clicks and sidebar card interactions
- Popover management for detailed signal information

**Key Functions**:
- `displaySignalBoundary(signal)`: Displays signal boundaries on map with appropriate styling
- Map event handlers for pin clicks and signal interactions
- Integration with LiveReportSidebar for card-to-map interactions

**Props**:
- `isOpen`: Controls sidebar visibility
- `onClose`: Callback to close sidebar
- `signals`: Array of signal data to display
- `onCardClick`: Handler for card selection (triggers map interaction)
- `mapRef`: Reference to Mapbox map instance
- `mapLoaded`: Map initialization state
- `addCustomLayers`: Function to add custom map layers
- `onToggleLiveReport`: Handler for live report sidebar toggle
- `isLiveReportOpen`: Current sidebar state

#### `SignalPopover.tsx`
**Purpose**: Detailed information popup that appears when signals are clicked.

**Features**:
- Precise positioning relative to map pins
- Comprehensive signal information display
- Community details integration
- Responsive layout with proper text wrapping
- Close button and click-outside-to-close functionality

**Props**:
- `popover`: Current popover data and position
- `setPopover`: Function to update popover state
- `onClose`: Cleanup callback when popover closes
- `onOpenCommunityInfo`: Handler for community info sheet
- `infoBubble`: Small info bubble display data

### Hooks Directory

#### `useSignals.ts`
**Purpose**: Custom hook that manages all signal-related state and data.

**Responsibilities**:
- Signal data initialization and management
- Popover state management
- Info bubble state handling
- Centralized signal data structure
- Mock data provision for development

**Returns**:
- `otherSignals`: Array of community signals
- `ownCommunitySignal`: Current user's community signal
- `popover`: Popover state and data
- `setPopover`: Popover state setter
- `infoBubble`: Info bubble state
- Signal manipulation utilities

### Types Directory

#### `signals.ts`
**Purpose**: Core type definitions for signal data and visualization state.

**Key Types**:
- `Signal`: Complete signal object with coordinates, properties, and boundary data
- `SignalPopover`: Popover positioning and content data
- `InfoBubble`: Small info bubble positioning
- `VisualizationSignals`: Return type for useSignals hook

### Utils Directory

#### `flyingEffects.ts`
**Purpose**: Map camera animation and movement utilities.

**Functions**:
- `flyToSignal(map, coord)`: Smooth camera animation to specific signal coordinates
- `cinematicMapEntrance(map, coord)`: Dramatic entrance animation for initial map load

**Features**:
- Customizable easing functions
- Configurable zoom, pitch, and bearing
- Smooth transition curves
- Performance-optimized animations

#### `mapHelpers.tsx`
**Purpose**: Map layer management and visual styling utilities.


## 🔄 Data Flow

1. **Signal Data**: `useSignals` hook provides signal data and state management
2. **Map Rendering**: Main component initializes Mapbox and renders signals as pins
3. **User Interaction**: 
   - Pin clicks → Display boundaries + Show popover
   - Sidebar card clicks → Display boundaries + Fly to location + Show popover
   - Control interactions → Layer changes, zoom, etc.
4. **State Updates**: All interactions update centralized state through hooks
5. **UI Updates**: Components re-render based on state changes
