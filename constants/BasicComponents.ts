import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  background: {
  flex: 1,
  width: '100%',
  backgroundColor: '#2F97FF',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start', // start at top
    // filled background for the login screen.
  },

  itemHolder: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    gap: 10,
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

  subItemHolder: {
    backgroundColor: '#E8EFF0',
    borderRadius: 16,
    padding: 16,
    gap: 10,
    // boxShadow is not supported directly in RN; we emulate it below
    
    shadowRadius: 8,
    elevation: 4, // for Android
    // boxSizing is not applicable in React Native
    display: 'flex',
    flexDirection: 'column',
    // gap is not supported in RN – use marginBottom or spacing components
    alignItems: 'center',
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

  //button Variants
  skyboundButtonPrimary: {
    color: 'white',
    backgroundColor: '#0071E2',
    fontFamily: 'Regular',
    fontSize: 16, // 1rem ≈ 16px
  },

  skyboundButtonDelete: {
    backgroundColor: 'transparent',
    fontFamily: 'Regular',
    fontSize: 16
  },

  skyboundButtonLogin: {
    color: 'black',
    fontFamily: 'Regular',
    fontSize: 16,
  },

  // hover state cannot be defined in RN styles directly
  // Use Pressable with conditional styles for hover/pressed states
  skyboundButtonPrimaryHover: {
    backgroundColor: 'darkblue',
  },

  skyboundTextBox: {
    borderWidth: 2,
    borderRadius: 12,
    borderColor: '#E5E7EB',
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

  skyboundTextPrimaryBold: {
    fontFamily: 'Regular',
    color: '#111827',
    fontWeight: 'bold',
  },
  skyboundTextSecondary: {
    fontFamily: 'Regular',
    color: '#585858',
  },
  skyboundTextError: {
    fontFamily: 'Regular',
    color: '#ef4444',
  },

  skyboundNavBarText: {
    color: '#0071E2',
    fontWeight: 'bold',
    fontSize: 20
  },

  skyboundButtonTextPrimary: {
    fontFamily: 'Regular',
    color: '#FFFFFF'
  },

  skyboundDeleteButtonText: {
    fontFamily: 'Regular',
    color: '#3b82f6',
  }
});