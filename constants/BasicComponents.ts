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

  itemHolderLight: {
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
    justifyContent: 'center' 
    // Item holder box for things
  },

   itemHolderDark: {
    backgroundColor: '#1E1E1E',
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
    justifyContent: 'center' 
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

  // ============== BUTTON STYLES ===============

  skyboundButton: {
    borderRadius: 20,
    // React Native doesn't support box-shadow like web; use shadow props
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0071E2',
    // cursor: pointer not applicable in RN
    // border: none – not required in RN if no border
    // transition not supported – use Reanimated or Pressable feedback
  },

  //button Variants
  skyboundButtonPrimaryLight: {
    color: 'white',
    backgroundColor: '#0071E2',
    fontFamily: 'Regular',
    fontSize: 16, 
  },

  skyboundButtonSecondaryLight: {
    backgroundColor: 'white',
    borderColor: '#1E1E1E',
    fontFamily: 'Regular',
    fontSize: 16,
  },

  skyboundButtonSecondaryDark: {
    backgroundColor: '#1E1E1E',
    borderColor: 'white',
    fontFamily: 'Regular',
    fontSize: 16,
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

  SkyboundButtonGroupInactiveDark: {
     
    backgroundColor: '#49454F',
    fontFamily: 'Regular',
    fontSize: 16, 
  },


  SkyboundButtonGroupInactiveLight: {
    
    backgroundColor: "white",
    fontFamily: 'Regular',
    fontSize: 16, 

  },



// ================= TEXT BOX STYLES =================

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

  // ================= TEXT STYLES =================
  
  skyboundText: {
    fontFamily: 'Regular',
    color: '#111827',
  },

  // text variants
  skyboundTextPrimaryLight: {
    fontFamily: 'Regular',
    color: '#111827',
  },

  skyboundTextPrimaryLightBold: {
    fontFamily: 'Bold',
    color: '#111827',
    
  },
  skyboundTextSecondaryLight: {
    fontFamily: 'Regular',
    color: '#585858',
  },

   skyboundTextPrimaryDark: {
    fontFamily: 'Regular',
    color: '#F3F4F6',
  },

  skyboundTextPrimaryDarkBold: {
    fontFamily: 'Bold',
    color: '#F3F4F6',
    
  },
  skyboundTextSecondaryDark: {
    fontFamily: 'Regular',
    color: '#585858',
  },

  skyboundTextError: {
    color: 'red',
    fontFamily: 'Regular',
  },
 

  skyboundBlueTextLight: {
    color: '#0071E2',
    fontFamily: 'Bold',
    fontSize: 20
  },

    skyboundBlueTextDark: {
    color: '#4DA3FF',
    fontFamily: 'Bold',
    fontSize: 20
  },


  // ================ BUTTON TEXT STYLES =================

  skyboundButtonTextPrimaryLight: {
    fontFamily: 'Regular',
    color: '#FFFFFF'
  },

   skyboundButtonTextPrimaryDark: {
    fontFamily: 'Regular',
    color: '#000000'
  },

  skyboundDeleteButtonText: {
    fontFamily: 'Regular',
    color: '#3b82f6',
  }
});