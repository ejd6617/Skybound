import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  background: {
    backgroundColor: '#2F97FF',
    height: '100%', // 100vh is not directly supported, use flex or Dimensions for full height
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // filled background for the login screen.
  },

  itemHolder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    // boxShadow is not supported directly in RN; we emulate it below
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4, // for Android
    // boxSizing is not applicable in React Native
    display: 'flex',
    flexDirection: 'column',
    // gap is not supported in RN – use marginBottom or spacing components
    alignItems: 'center',
    // Item holder box for things
  },

  skyboundButton: {
    borderRadius: 20,
    // React Native doesn't support box-shadow like web; use shadow props
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center' 
    // cursor: pointer not applicable in RN
    // border: none – not required in RN if no border
    // transition not supported – use Reanimated or Pressable feedback
  },

  skyboundButtonPrimary: {
    color: 'white',
    backgroundColor: '#0071E2',
    fontFamily: 'Regular',
    fontSize: 16, // 1rem ≈ 16px
  },

  // hover state cannot be defined in RN styles directly
  // Use Pressable with conditional styles for hover/pressed states
  skyboundButtonPrimaryHover: {
    backgroundColor: 'darkblue',
  },

  skyboundTextBox: {
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontFamily: 'Regular',
    fontSize: 16,
    // outline: none – not applicable in RN
    // transition: border-color not supported directly
  },

  skyboundTextBoxFocus: {
    borderColor: '#3b82f6',
  },

  skyboundText: {
    fontFamily: 'Regular',
    color: '#111827',
  },

  // text variants
  skyboundTextPrimary: {
    fontFamily: 'Regular',
    color: '#111827',
  },
  skyboundTextSecondary: {
    fontFamily: 'Regular',
    color: '#585858',
  },
  skyboundTextError: {
    fontFamily: 'Regular',
    color: '#ef4444',
  },
});