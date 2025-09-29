# Community Groups Components - Clean Architecture

This directory contains the clean, simplified Community Groups feature with global state management.

## 📁 File Structure

```
components/
├── CommunityGroupDrawer.tsx              # Main form component with global store
├── PhotoUploadArea.tsx                   # Photo upload component
├── NumberInputWithSpinner.tsx            # Number input with controls
├── CloseCreateDialog.tsx                 # Confirmation dialog
├── CommunityGroupInfoSheet.tsx           # Info display component
├── DataTable.tsx                         # Data table component  
├── Column.tsx                            # Table column definitions
├── SettingLocationPage.tsx               # Location setting page
├── SettingLocationControls.tsx           # Location controls
└── SettingLocationAlerts.tsx             # Location alerts

hooks/
├── useFormStore.ts                       # Global store hook
├── useLocationPickerResults.ts           # Location picker integration
└── useNotableInfoManagement.ts          # Notable info management

store/
└── formStore.ts                          # Global form state store

types/
└── [type definitions]                    # TypeScript type definitions

utils/
└── [utility functions]                   # Helper functions
```

## 🏗️ Architecture

### Global State Store Pattern
- **`formStore.ts`**: Global JavaScript store that persists form data across navigation
- **`useFormStore.ts`**: React hook that connects components to the global store
- **No complex session management**: Data persists in memory during navigation

### Key Benefits
- ✅ **Form data persists** when navigating to location picker
- ✅ **Photos remain uploaded** across navigation  
- ✅ **Simple state management** with global store
- ✅ **No serialization issues** with File objects
- ✅ **Clean separation of concerns**

## 🔄 Data Flow

1. User fills form → Data stored in global store
2. User navigates to location picker → Component unmounts but store persists
3. User returns → Component remounts and connects to same store
4. All data including photos are still available

## 🧹 Cleanup Completed

Removed unused files:
- ❌ `CreateCommunityGroupSheetRefactored.tsx` (old complex version)
- ❌ `CommunityGroupDrawerSimple.tsx` (context-based version)  
- ❌ `CommunityGroupDrawerWrapper.tsx` (unnecessary wrapper)
- ❌ `FormContext.tsx` (replaced by global store)
- ❌ `useSessionRestore.ts` (no longer needed)
- ❌ `useFormPersistence.tsx` (replaced by store)
- ❌ `useFormInitialization.ts` (simplified)
- ❌ `usePhotoManagement.ts` (moved to store)
- ❌ `hooks/index.ts` (unused exports)
- ❌ `context/` directory (no longer needed)

## 🚀 Usage

The main component is now `CommunityGroupDrawer` which uses the global store pattern for reliable form persistence across navigation.

## 🏗️ Refactored Components

### 1. CreateCommunityGroupSheetRefactored.tsx
**Purpose**: Clean, simplified main form component
**Key Features**:
- Uses extracted components and hooks
- Simplified state management
- Better TypeScript types
- Improved user experience

**Props**:
```typescript
interface CommunityGroupDrawerProps {
  isOpen: boolean
  onClose: () => void
  isEditing?: boolean
  editData?: any
}
```

### 2. PhotoUploadAreaNew.tsx
**Purpose**: Multi-photo upload with grid display
**Key Features**:
- Support for multiple photos (max 5)
- Grid layout for photo display
- Individual photo replace/delete
- File validation (type, size)
- Blob URL management for memory efficiency

**Props**:
```typescript
interface PhotoUploadAreaProps {
  photos: File[]
  onChange: (photos: File[]) => void
  maxPhotos?: number
}
```

### 3. NumberInputWithSpinner.tsx
**Purpose**: Number input with increment/decrement controls
**Key Features**:
- Spinner controls (click and hold)
- Keyboard support (arrow keys)
- Mouse wheel support
- Input validation
- Responsive behavior

**Props**:
```typescript
interface NumberInputWithSpinnerProps {
  value: number
  onChange: (value: string) => void
  min?: number
  step?: number
  ariaLabel?: string
}
```

### 4. NotableInfoInputs.tsx
**Purpose**: Dynamic list of text inputs
**Key Features**:
- Add/remove inputs dynamically
- Always maintains at least one input
- Clear individual inputs
- Responsive layout

**Props**:
```typescript
interface NotableInfoInputsProps {
  notableInfoList: string[]
  onChange: (list: string[]) => void
}
```

## 🔧 Custom Hook

### useFormPersistence.tsx
**Purpose**: Manages form data persistence across navigation
**Key Features**:
- Session storage management
- Base64 photo conversion for storage
- Navigation handling
- Edit mode support
- Automatic cleanup

**Options**:
```typescript
interface FormPersistenceOptions {
  sessionKey: string
  isEditing: boolean
  editData?: any
  initialData: CommunityGroupData
}
```

**Returns**:
```typescript
{
  saveToSession: (data: CommunityGroupData) => Promise<void>
  restoreFromSession: () => Promise<CommunityGroupData | null>
  clearSession: () => void
  navigateToLocationSetting: (data: CommunityGroupData) => Promise<void>
  getInitialFormData: () => Promise<CommunityGroupData>
}
```

## 🎯 Key Improvements

### 1. **Code Organization**
- **Before**: Single 1198-line component with everything mixed together
- **After**: 5 focused components + 1 custom hook, each under 200 lines

### 2. **State Management**
- **Before**: Multiple competing useEffects causing infinite loops
- **After**: Single initialization effect with proper dependency management

### 3. **Data Persistence**
- **Before**: Complex session management with race conditions
- **After**: Dedicated hook with proper serialization/deserialization

### 4. **Image Handling**
- **Before**: Base64 strings causing display issues
- **After**: Proper blob URLs with memory cleanup

### 5. **Type Safety**
- **Before**: Loose typing with potential runtime errors
- **After**: Strong TypeScript interfaces throughout

## 🔄 Migration Guide

To use the refactored components:

1. **Import the new components**:
```typescript
import { 
  CreateCommunityGroupSheet,
  PhotoUploadArea,
  NumberInputWithSpinner,
  NotableInfoInputs,
  useFormPersistence 
} from './components'
```

2. **Update component usage**:
```typescript
// Old way
<CreateCommunityGroupSheet /* complex props */ />

// New way
<CreateCommunityGroupSheet
  isOpen={isOpen}
  onClose={onClose}
  isEditing={isEditing}
  editData={editData}
/>
```

3. **Replace individual components**:
```typescript
// Photos
<PhotoUploadArea
  photos={photos}
  onChange={setPhotos}
  maxPhotos={5}
/>

// Number inputs
<NumberInputWithSpinner
  value={members}
  onChange={setMembers}
  min={0}
/>

// Dynamic lists
<NotableInfoInputs
  notableInfoList={info}
  onChange={setInfo}
/>
```

## 🐛 Bug Fixes

1. **✅ Maximum update depth exceeded**: Fixed competing useEffect loops
2. **✅ Data loss on navigation**: Proper session persistence
3. **✅ Images not displaying**: Correct blob URL handling
4. **✅ Edit mode issues**: Proper initialization and state management

## 🚀 Performance Improvements

- **Memory Management**: Proper blob URL cleanup prevents memory leaks
- **Debounced Saves**: Auto-save with 500ms debounce reduces storage calls
- **Efficient Re-renders**: Better dependency arrays prevent unnecessary updates
- **Component Splitting**: Smaller components enable better tree shaking

## 📝 Console Logging

All components include comprehensive logging with emoji indicators:
- 🏗️ Component renders
- 📸 Photo operations
- 💾 Data persistence
- 🔄 State changes
- ✅ Success operations
- ❌ Error conditions

## 🧪 Testing Considerations

1. **Form Persistence**: Test navigation away and back to form
2. **Photo Handling**: Test upload, replace, delete operations
3. **Edit Mode**: Test pre-filling and persistence
4. **Validation**: Test file type/size validation
5. **Session Management**: Test session restoration and cleanup

## 🔮 Future Enhancements

1. **Drag & Drop**: Add drag and drop for photo uploads
2. **Image Optimization**: Add client-side image compression
3. **Progress Indicators**: Show upload progress for large files
4. **Undo/Redo**: Add form state history management
5. **Auto-save Indicators**: Visual feedback for auto-save operations