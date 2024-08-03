import React from 'react';
import { Box, Typography, Button } from "@mui/material";
import { auth, googleProvider } from './firebase';
import { signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const navigate = useNavigate();

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home'); // Redirect to home page after successful sign-in
    } catch (error) {
      console.error("Error signing in with Google: ", error);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100vh"
    >
      <Typography variant="h4" marginBottom={4}>
        Sign In to Pantry App
      </Typography>
      <Button
        variant="contained"
        color="primary"
        onClick={signInWithGoogle}
      >
        Sign In with Google
      </Button>
    </Box>
  );
};

export default SignIn;