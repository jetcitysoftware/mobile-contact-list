import React from 'react';
import uuid from 'uuid/v4';
import { Modal, StyleSheet, Text, TextInput, View, FlatList, Button, AsyncStorage } from 'react-native';
import ModalPicker from 'react-native-modal-selector';
import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';

import Contact from './contact.js';

export default class ContactListClass extends React.PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      swiping:false,
      permission:false,
      groups: {},
      contacts:[],
      activeSections: [],
      newGroupName:'',
      activeGroup: 'All Contacts',
    };
  }

  async componentDidMount() {
    const {permission} = await Permissions.askAsync(Permissions.CONTACTS);
    this.setState({permission});
    this.setupGroups();
  }

  setupGroups = async () => {

    const contacts = await this.getAllContacts() || [];
    const storedGroups = await this.getGroups();

    const groupAssignments = JSON.parse(storedGroups) || {};

    const indexedContacts = contacts.reduce( (list,contact) => {
      list[contact.id] = contact;
      return list;
    },{});

    const groups = Object.keys(groupAssignments).reduce( (list,group) => {
      let groupContacts = groupAssignments[group];
      let entry = {};
      entry.key = uuid();
      entry.name = group;
      entry.contacts = groupContacts.map( (contactId) => {
        indexedContacts[contactId];
      });
      list[group] = entry;
      return list;
    },{});

    groups['All Contacts'] = {
      key: 'defaultGroup',
      name: 'All Contacts',
      contacts: Object.values(indexedContacts),
    };

    this.setState({contacts, groups});
  };

  getGroups = async () => {
    try {
      const groups = await AsyncStorage.getItem('GROUPS');
      return groups;
    } catch (error) {
      return [];
    }
  };

  handleChange = text => {
    this.setState({newGroupName:text});
  };

  selectGroup = activeGroup => {
    this.setState({activeGroup});
  };

  createGroup = async () => {
    try {
      const storedGroups = await AsyncStorage.getItem('GROUPS');
      const groups = JSON.parse(storedGroups || '{}');
      groups[this.state.newGroupName] = [];
      await AsyncStorage.setItem('GROUPS',JSON.stringify(groups));
      this.setupGroups();
    } catch (error) {
      console.log('add group fail', error);
    }
  };

  deleteGroup = async (group) => {
    try {
      const groups = this.state.groups;
      delete groups[group];
      await AsyncStorage.setItem('GROUPS',JSON.stringify(groups));
      this.setupGroups();
    } catch (error) {
      console.log('clear group fail', error);
      return {};
    }
  };

  getAllContacts = async () => {
    const phoneContacts = await Contacts.getContactsAsync();
    return phoneContacts.data.sort( (a,b) => a.name > b.name );
  };

  isSwiping = (swiping) => {
    this.setState({swiping});
  };

  contactKeyExtractor = (item) => item.id;

  renderHeader = group => {
    return (
      <View>
        <Text style={styles.section}>{group.name}</Text>
      </View>
    );
  };

  render() {

    let groupList = Object.keys(this.state.groups).map( (group,idx) => ({key: idx, label: group}) ) || [];

    return (
      <View style={styles.container}>

        <FlatList
          scrollEnabled={!this.state.swiping}
          data={this.state.groups[this.state.activeGroup] && this.state.groups[this.state.activeGroup].contacts}
          keyExtractor={this.contactKeyExtractor}
          renderItem={ ({item}) => <Contact groups={this.state.groups} swiping={this.isSwiping} contact={item} /> }
        />

        <ModalPicker
          data={groupList}
          initValue="All Contacts"
          onChange={(option)=>{ this.selectGroup(option.label);}}
        >

          <Button style={styles.submit} onPress={() => {}} title="Filter Contacts" />

        </ModalPicker>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 40,
  },
  modal: {
    backgroundColor: '#eee',
    borderWidth: 1,
    flex:1,
    padding:40,
    margin:0,
  },
  section: {
    textAlign: 'left',
    backgroundColor: '#ccc',
    color: '#000',
    padding: 20,
  },
  form: {
    display:'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },
  input: {
    height: 40,
    padding: 10,
    backgroundColor: '#ccc',
    borderBottomColor: '#000',
  },
  submit: {
    borderColor: '#ccc',
    backgroundColor: '#eee',
    padding: 10,
  },
  group: {
    padding:20,
    margin:2,
    backgroundColor: '#0C78B6',
    color: '#fff',
  },
});
