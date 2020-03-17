import React from 'react';
import { StyleSheet, Text, Linking, Modal } from 'react-native';
import Swipeable from 'react-native-swipeable-row';
import { debounce } from 'lodash';
import ModalPicker from 'react-native-modal-selector';
import * as SMS from 'expo-sms';

const styles = StyleSheet.create({
  contact: {
    textAlign: 'left',
    backgroundColor: '#f5f5f5',
    margin:1,
    padding: 20,
  },
  sms: {
    textAlign: 'left',
    backgroundColor: '#0C78B6',
    color: 'white',
    padding: 20,
  },
  call: {
    textAlign: 'right',
    backgroundColor: '#11880C',
    color: 'white',
    padding: 20,
  },
});


const LeftContent = props => <Text style={styles.call}>Call</Text>;
const RightContent = props => <Text style={styles.sms}>Text</Text>;

const Contact = props => {

  const makeCall = async () => {
    try {
      let phoneNumber = props.contact.phoneNumbers[0].digits;
      let link = `tel:${phoneNumber}`;
      // let call = await Linking.openURL(link);
    }
    catch(e) { console.log(e); }
  };

  const sendText = async () => {
    try {
      let phoneNumber = props.contact.phoneNumbers[0].digits;
      // const {sms} = await SMS.sendSMSAsync([phoneNumber]);
    }
    catch(e) { console.log(e); }
  };

  const pickGroup = (group) => {
    // Assign to the right group
    // Save
    // Trigger the re-query/re-draw
  };

  let groupList = Object.keys(props.groups).map( (group,idx) => ({key: idx, label: group}) ) || [];

  return (
    <Swipeable
      leftContent={<LeftContent/>}
      onLeftActionRelease={makeCall}
      rightContent={<RightContent/>}
      onRightActionRelease={sendText}
      onSwipeStart={
        debounce(() => { props.swiping(true); }, 100)
      }
      onSwipeRelease={ () => props.swiping(false) }
    >
      <Text style={styles.contact}> {props.contact.name} </Text>

    </Swipeable>
  );
};

export default Contact;
