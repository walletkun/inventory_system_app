"use client";
import { Box, Modal, Stack, Typography, Button, TextField, Grid, Collapse} from "@mui/material";
import { useEffect, useState, useNavigate} from "react";
import React from "react"
import { firestore } from './firebase'; // Adjust the path according to your project structure
import { collection, doc, getDoc, getDocs, query, setDoc, deleteDoc, updateDoc} from "firebase/firestore";
import "./animation.css";
import "./globals.css";


export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [item, setItemName] = useState("");
  const [itemQuantity, setItemQuantity] = useState(0);
  const [open, setOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [addedItemId, setAddedItemId] = useState(null);
  const [removedItemId, setRemovedItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleDeleteOpen = () => setDeleteOpen(true);
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setErrorMessage("");
  }

  const handleEditOpen = (item) => {
    setCurrentEditItem(item);
    setItemName(item.id);
    setItemQuantity(item.quantity);
    setEditOpen(true);
  }
  const handleEditClose = () => {
    setEditOpen(false);
    setCurrentEditItem(null);
    setItemName("");
    setItemQuantity(0);
  }


  const updatePantries = async () => {
    try{
      const snapshot = await getDocs(collection(firestore, "pantry"));
      const pantryList = [];
      snapshot.forEach((item) => {
        pantryList.push({ id: item.id, ...item.data() });
      });
      pantryList.sort((a, b) => a.id.localeCompare(b.id));
      setPantry(pantryList);
    } catch (error) {
      console.error("Error updating pantries: ", error);
    }
  };

  // const addItemQuantity = async (item, value) => {
  //   try {
  //     const docRef = doc(collection(firestore, "pantry"), item);
  //     const docSnap = await getDoc(docRef);

  //     if (docSnap.exists()) {
  //       const data = docSnap.data();
  //       const quantity = data.quantity;

  //       if (isNaN(quantity)) {
  //         await setDoc(docRef, { quantity: value });
  //       } else {
  //         await updateDoc(docRef, { quantity: quantity + value });
  //       }
  //     } else {
  //       await setDoc(docRef, { quantity: value });
  //     }

  //     await updatePantries();
  //   } catch (error) {
  //     console.error("Error adding item quantity: ", error);
  //   }
  // };


  const deleteItemPantries = async (item, itemQuantity) => {
    try {
      const docRef = doc(collection(firestore, "pantry"), item);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const { quantity } = docSnap.data();
        const newQuantity = quantity - itemQuantity;
        if(itemQuantity > quantity) {
          setErrorMessage("Quantity to delete exceeds available inventory. Quantity Amount: ", quantity);
          handleDeleteOpen();
        } 
        else {
          if(newQuantity <= 0) { 
            setRemovedItemId(item);
            setTimeout(async () => {
              await deleteDoc(docRef);  // Remove the document completely if quantity is zero or less
              await updatePantries();
              setRemovedItemId(null);
            }, 500);
          } 
          else {
          setRemovedItemId(item);
          setTimeout(async () => {
              await setDoc(docRef, { quantity: newQuantity });
              await updatePantries();
              setRemovedItemId(null);
            },1000);
          }
        }
      }
    } catch (error) {
      console.error("Error deleting item from pantries: ", error);
    }
  };

  const addPantries = async (item, quantity) => {
    try {
      const docRef = doc(collection(firestore, "pantry"), item);
      const docSnap = await getDoc(docRef);
      const numericQuantity = Number(quantity);
  
      if (numericQuantity <= 0 || isNaN(numericQuantity)) {
        setErrorMessage("Quantity must be a positive integer");
        handleOpen();
        return;// Exit the function early if quantity is invalid
      }
  
      if (docSnap.exists()) {
        const { quantity: existingQuantity } = docSnap.data();
  
        if (existingQuantity >= 0) {
            setAddedItemId(item);
            setTimeout(async () => {
            await setDoc(docRef, { quantity: existingQuantity + numericQuantity });
            await updatePantries();
            setAddedItemId(null);
          }, 100);
        }
      } else {
        // Add new item to pantry
        setAddedItemId(item);
        setTimeout(async () => {
          await setDoc(docRef, { quantity: numericQuantity });
          await updatePantries();
          setAddedItemId(null);
        }, 100);
      }
    } catch (error) {
      console.error("Error adding pantries: ", error);
    }
  };

  const editItem = async (itemId, newName, newQuantity) => {
    try{
      const docRef = doc(collection(firestore, "pantry"), itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const updatedData = { quantity: newQuantity };
        if (itemId !== newName) {
          await setDoc(doc(collection(firestore, "pantry"), newName), updatedData);
          await deleteDoc(docRef);
        } else {
          if(newQuantity <= 0) {
            setRemovedItemId(itemId);
            setTimeout(async () => {
              await deleteDoc(docRef);
              await updatePantries();
              setRemovedItemId(null);
            }, 1000); 
          }
          else{
            await updateDoc(docRef, { quantity: newQuantity });
            await updatePantries();
          }
      }
        handleEditClose();
        await updatePantries();
      }
    } catch (error) {
      console.error("Error editing item: ", error);
    }
  };


  useEffect(() => {
    updatePantries();
  }, []);


  const filteredPantry = pantry.filter((item) => 
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
);


  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      justifyContent="center"
      flexDirection="column"
      alignItems="center"
    >
        <Box
          position="absolute"
          top={0}
          width="50%"
          border="1px solid #333"
        >
          <Typography
            variant="h1"
            fontSize="2rem"
            color="#333"
            bgcolor="lightblue"
            textAlign="center"
          >
            Inventory Items
          </Typography>
        </Box>
          <Box
             width="100%"
             display="flex"
             justifyContent="center"
             gap= {2}
             marginTop={8}
             position="sticky"
             top={0}
             zIndex={1}>

            
          <Box width="300px"> {/* Adjust the width as needed */}
              <TextField
                variant="outlined"
                placeholder="Search items"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Box>
          <Box display={"flex"}
          justifyContent="center" 
          gap={2}
          alignContent={"center"}>
            <Button
              variant="contained" onClick={handleOpen}>
              Add item
            </Button>
          <Button variant="contained" onClick={handleDeleteOpen}>
              Delete item
            </Button>


          </Box>
        </Box>
              
            
        <Stack
          spacing={2} direction={"row"}>

          <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box
              position={"absolute"}
              top={"50%"}
              left={"50%"}
              width={400}
              bgcolor={"#fff"}
              border={"2px solid #00"}
              boxShadow={24}
              p={4}
              display={"flex"}
              flexDirection={"column"}
              gap={2}

              sx={{
                transform: "translate(-50%, -50%)"
              }}>

              <Typography id="modal-title" variant="h6" component="h2">
                Add item
              </Typography>
              <Stack width={"100%"} direction={"row"} spacing={2}>

                <Box width="100%">
                  <Typography display={"flex"}> Item: </Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Item name"
                    fullWidth
                    value={item}
                    onChange={(e) => setItemName(e.target.value)} />
                </Box>
                <Box width={"100%"}>
                  <Typography display={"flex"}> Quantity: </Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Quantity"
                    fullWidth
                    value={itemQuantity}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (!isNaN(value)) {
                        setItemQuantity(value);
                      }
                    } }>
                  </TextField>
                </Box>
                <Button
                  variant="Text"
                  display={"block"}
                  justifycontent={"center"}

                  onClick={() => {
                    addPantries(item, itemQuantity);
                    setItemQuantity(0);
                    setItemName("");
                    handleClose();
                  } }>
                  Add
                </Button>
              </Stack>
            </Box>
          </Modal>


          <Box
            gap={2}>

            <Modal
              open={deleteOpen}
              onClose={handleDeleteClose}
              aria-labelledby="modal-title"
              aria-describedby="modal-description">
              <Box
                position={"absolute"}
                top={"50%"}
                left={"50%"}
                width={400}
                bgcolor={"#fff"}
                border={"2px solid #00"}
                boxShadow={24}
                p={4}
                display={"flex"}
                flexDirection={"column"}
                gap={2}

                sx={{
                  transform: "translate(-50%, -50%)"
                }}
              >

                <Typography id="modal-title" variant="h6" component="h2">
                  Delete item
                </Typography>
                <Stack width={"100%"} direction={"row"} spacing={2}>

                  <Box width="100%">
                    <Typography display={"flex"}> Item: </Typography>
                    <TextField
                      variant="outlined"
                      placeholder="Item name"
                      fullWidth
                      value={item}
                      onChange={(e) => setItemName(e.target.value)} />
                  </Box>
                  <Box width={"100%"}>
                    <Typography display={"flex"}> Quantity: </Typography>
                    <TextField
                      variant="outlined"
                      placeholder="Quantity"
                      fullWidth
                      value={itemQuantity}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        if (!isNaN(value)) {
                          setItemQuantity(value);
                        }
                      } }>
                    </TextField>
                  </Box>
                  <Button
                    variant="Text"
                    display={"block"}
                    justifycontent={"center"}

                    onClick={() => {
                      deleteItemPantries(item, itemQuantity);
                      setItemQuantity(0);
                      setItemName("");
                      handleDeleteClose();
                    } }>
                    Delete
                  </Button>
                </Stack>
                {errorMessage && (
                  <Typography color="error">{errorMessage}</Typography>
                )}
              </Box>
            </Modal>
          </Box>


        <Box gap={2}>
          <Modal
            open={editOpen}
            onClose={handleEditClose}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            <Box
              position={"absolute"}
              top={"50%"}
              left={"50%"}
              width={400}
              bgcolor={"#fff"}
              border={"2px solid #00"}
              boxShadow={24}
              p={4}
              display={"flex"}
              flexDirection={"column"}
              gap={2}
              sx={{ transform: "translate(-50%, -50%)" }}
            >
              <Typography id="modal-title" variant="h6" component="h2">
                Edit item
              </Typography>
              <Stack width={"100%"} direction={"row"} spacing={2}>
                <Box width="100%">
                  <Typography display={"flex"}> Item: </Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Item name"
                    fullWidth
                    value={currentEditItem ? currentEditItem.id : ""}
                    onChange={(e) => {
                      const updatedItem = { ...currentEditItem, id: e.target.value };
                      setCurrentEditItem(updatedItem);
                    }}
                  />
                </Box>
                <Box width={"100%"}>
                  <Typography display={"flex"}> Quantity: </Typography>
                  <TextField
                    variant="outlined"
                    placeholder="Quantity"
                    fullWidth
                    value={currentEditItem ? currentEditItem.quantity : 0}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (!isNaN(value)) {
                        const updatedItem = { ...currentEditItem, quantity: value };
                        setCurrentEditItem(updatedItem);
                      }
                    }}
                  />
                </Box>
                <Button
                  variant="Text"
                  display={"block"}
                  justifycontent={"center"}
                  onClick={() => {
                    editItem(currentEditItem.id, currentEditItem.id, currentEditItem.quantity);
                    handleEditClose();
                  }}
                >
                  Save
                </Button>
              </Stack>
            </Box>
          </Modal>
          </Box>
        </Stack>
        <Box 
        overflow="auto"
        width="100%"
        padding={2}
        marginTop={2}
        justifyContent={"center"}
        alignItems={"center"}
        sx={{
          '@media (max-width: 500px)': {
            flexDirection: 'column',
            alignItems: 'center',
          }
        }}>
          <Grid container spacing={2} justifyContent="center">
            
            {pantry.filter((item) =>
            item.id.toLowerCase().includes(searchQuery.toLowerCase())
          ).map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <Collapse in={true} timeout={200}>
                <Box
                  className={`pantry-item ${item.id === addedItemId ? "fadeIn" : ""} ${item.id === removedItemId ? "fadeOut" : ""} pantry-item ${item.id === addedItemId ? "fadeIn" : ""} ${item.id === removedItemId ? "fadeOut" : ""}`}
                  width="100%"
                  height="100px"
                  paddingBottom={2}
                  display="flex"
                  flexDirection="column"
                  justifyContent="center"
                  alignItems="center"
                  bgcolor="#f0f0f0"
                  padding={2}
                  borderRadius={2}
                  boxShadow={3}
                >
                  <Typography fontSize="1.5rem" color="#333">
                    {item.id}
                  </Typography>
                  <Typography fontSize="1.2rem" color="#333">
                    {item.quantity}
                  </Typography>
                  <Button variant="contained" size="small" onClick={() => handleEditOpen(item)}>
                    Edit
                  </Button>
                </Box>
              </Collapse>
            </Grid>
          ))}
          </Grid>
        </Box>
      </Box>
  );
}
