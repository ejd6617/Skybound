import { Dimensions, StyleSheet } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  loginBackground: {
    backgroundColor: '#2F97FF',
    height: screenHeight,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    /*filled background for the login screen.*/
  },
  loginItemHolder: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 200,
    height: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    /*Item holder box for things*/
  },
  loginSkyboundButton: {
    backgroundColor: 'blue',
    borderRadius: 16,
    width: 100,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loginSkyboundButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default styles;