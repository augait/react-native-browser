import { openBrowser } from "@swan-io/react-native-browser";
import * as React from "react";
import {
  Button,
  Platform,
  SafeAreaView,
  StatusBar,
  StatusBarProps,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import parseUrl from "url-parse";
import { supabase } from "./supabaseClient";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  button: {
    marginTop: 10,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
});

export const App = () => {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [session, setSession] = React.useState(null);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) throw error;
      alert("Check your email for the confirmation link!");
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) setError(error.message);
  };

  const handleOnPress = React.useCallback(() => {
    let entry: StatusBarProps | undefined;

    openBrowser("https://swan.io", {
      animationType: "slide",
      dismissButtonStyle: "close",
      barTintColor: "#FFF",
      controlTintColor: "#000",
      onOpen: () => {
        entry = StatusBar.pushStackEntry({
          animated: true,
          barStyle:
            Platform.OS === "ios" && Number.parseInt(Platform.Version, 10) >= 13
              ? "light-content"
              : "dark-content",
        });
      },
      onClose: (url) => {
        if (entry) {
          StatusBar.popStackEntry(entry);
        }

        if (url) {
          const { protocol, host, query } = parseUrl(url, true);
          const origin = `${protocol}//${host}`;

          if (origin === "io.swan.rnbrowserexample://close") {
            console.log(JSON.stringify(query, null, 2));
          }
        }
      },
    }).catch((error) => {
      console.error(error);
    });
  }, []);

  if (!session) {
    return (
      <SafeAreaView style={styles.container}>
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />
        <View style={styles.button}>
          <Button 
            title={loading ? "Loading..." : "Sign In"} 
            onPress={handleSignIn}
            disabled={loading}
          />
        </View>
        <View style={styles.button}>
          <Button 
            title={loading ? "Loading..." : "Sign Up"} 
            onPress={handleSignUp}
            disabled={loading}
          />
        </View>
        {error && <Text style={styles.error}>{error}</Text>}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text>Welcome {session.user.email}</Text>
      <View style={styles.button}>
        <Button title="Open browser" onPress={handleOnPress} />
      </View>
      <View style={styles.button}>
        <Button title="Sign Out" onPress={handleSignOut} />
      </View>
    </SafeAreaView>
  );
};