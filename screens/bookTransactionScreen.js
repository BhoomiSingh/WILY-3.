import React from 'react';
import { Text, View, TouchableOpacity, TextInput, Image, StyleSheet, TextComponent, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase';
import db from '../config';

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedBookId: '',
        scannedStudentId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
      const {buttonState} = this.state

      if(buttonState==="BookId"){
        this.setState({
          scanned: true,
          scannedBookId: data,
          buttonState: 'normal'
        });
      }
      else if(buttonState==="StudentId"){
        this.setState({
          scanned: true,
          scannedStudentId: data,
          buttonState: 'normal'
        });
      }
      
    }
    initiateBookIssue=async()=>{
      db.collection('transactions').add({
        studentId: this.state.scannedStudentId,
        bookId : this.state.scannedBookId,
        transcationType: 'issued'      
      })
      db.collection('books').doc(this.state.scannedBookId).update({
        bookAvaliblity: false
      })
      db.collection('students').doc(this.state.scannedStudentId).update({
        noOfBooksIssued: firebase.firestore.FieldValue.increment(1)
      })
      this.setState({
        scannedBookId: '',
        scannedStudentId: ''
      })
    }

    initiateBookReturn=async()=>{
      db.collection('transactions').add({
        studentId: this.state.scannedStudentId,
        bookId : this.state.scannedBookId,
        transcationType: 'returned'
      })
      db.collection('books').doc(this.state.scannedBookId).update({
        bookAvaliblity : true
      })
      db.collection('students').doc(this.state.scannedStudentId).update({
        noOfBooksIssued: firebase.firestore.FieldValue.increment(-1)
      })
      this.setState({
        scannedBookId: '',
        scannedStudentId: ''
      })
    }

    handleTransaction= async()=>{
      db.collection('books').doc(this.state.scannedBookId).get()
      .then((doc)=>{
        var book = doc.data()
        if (book.bookAvaliblity=== true){
          this.initiateBookIssue();
          Alert.alert('book issued')
        }
        else {
          this.initiateBookReturn();
          Alert.alert('book returned')
        }
      })
      
    }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !== "normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
            <View>
              <Image
                source={require("../assets/booklogo.jpg")}
                style={{width:200, height: 200}}/>
              <Text style={{textAlign: 'center', fontSize: 30}}>Wily</Text>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              onChangeText={(t)=>{
                this.setState({scannedBookId: t})
              }}
              style={styles.inputBox}
              placeholder="Book Id"
              value={this.state.scannedBookId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("BookId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <View style={styles.inputView}>
            <TextInput 
              style={styles.inputBox}
              placeholder="Student Id" onChangeText={(t)=>{
                this.setState({scannedStudentId: t})
              }}
              value={this.state.scannedStudentId}/>
            <TouchableOpacity 
              style={styles.scanButton}
              onPress={()=>{
                this.getCameraPermissions("StudentId")
              }}>
              <Text style={styles.buttonText}>Scan</Text>
            </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.submitButton}
                              onPress={()=>{
                                this.handleTransaction()
                              }}>
              <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
      backgroundColor: '#9ADD4C',
      width: 100,
      height: 30
    },
    submitButtonText:{
      textAlign: 'center',
      fontSize: 20,
      fontWeight: 'bold',
      color: 'white'
    }
  });