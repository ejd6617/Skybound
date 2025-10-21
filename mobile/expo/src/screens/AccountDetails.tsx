/*
import { Alert } from 'react-native';
import { auth } from '../firebase';
import {
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

async function handleDeleteAccount() {
  const user = auth.currentUser;
  if (!user || !user.email) {
    Alert.alert('Error', 'No user is currently signed in.');
    return;
  }

  // Ask the user for their password (simple cross-platform prompt)
  // Once we do a settings/profile screen, we can do a proper password field.
  let enteredPassword = '';
  await new Promise<void>((resolve) => {
    Alert.prompt?.(
      'Confirm Password',
      'Please enter your password to delete your account.',
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resolve() },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: (pw) => {
            enteredPassword = pw ?? '';
            resolve();
          },
        },
      ],
      'secure-text'
    ) ?? resolve(); // Android fallback (no Alert.prompt) -> we’ll show another alert below
  });

  // Android fallback if Alert.prompt doesn't exist:
  if (!enteredPassword) {
    Alert.alert(
      'Password required',
      'Please add a password prompt UI on Android and pass it into handleDeleteAccount.'
    );
    return;
  }

  try {
    // Re-authenticate
    const credential = EmailAuthProvider.credential(user.email, enteredPassword);
    await reauthenticateWithCredential(user, credential);

    // Delete user
    await deleteUser(user);

    Alert.alert('Account deleted', 'Your account has been permanently deleted.');
    // Optionally navigate back to Login
    // @ts-ignore
    // navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  } catch (error: any) {
    Alert.alert('Delete failed', error.message);
  }
}

<Pressable onPress={handleDeleteAccount} style={{ padding: 12 }}>
  <SkyboundText variant="secondary" style={{ color: 'crimson' }}>
    Delete my account
  </SkyboundText>
</Pressable>
*/