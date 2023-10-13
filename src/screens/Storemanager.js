import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Image,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  BackHandler,
  Modal,
} from 'react-native';
import React, {useState, useEffect} from 'react';
import {
  BACKGROUND,
  BACKGROUNDBLACK,
  BLACK,
  BLUE,
  BRAND,
  BRANDBLUE,
  GRAY,
  GREEN,
  PINK,
  RED,
  TABGRAY,
  WHITE,
} from '../constants/color';
import {HEIGHT, MyStatusBar, WIDTH} from '../constants/config';
import {Loader} from '../components/Loader';
import {useFocusEffect} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkuserToken} from '../redux/actions/auth';
import {useDispatch} from 'react-redux';
import {ADD, LOGO, PROFILE} from '../constants/imagepath';
import {getObjByKey, storeObjByKey} from '../utils/Storage';
import {TextInputName} from '../components/TextInputName';

const Storemanager = ({navigation}) => {
  const dispatch = useDispatch();
  const [loader, setLoader] = useState(false);
  const [userdata, setUserdata] = useState(false);
  const [inventory, setInventory] = useState([]);
  const [addmodal, setaddModal] = useState(false);
  const [editmodal, seteditmodalModal] = useState(false);
  const [pid, setPid] = useState('');
  const [pname, setPname] = useState('');
  const [mrp, setMrp] = useState('');
  const [batchno, setBatchno] = useState('');
  const [quantity, setQuantity] = useState('');
  const [staticData, setStatic] = useState({
    vendor: 'Company',
    batchdate: new Date(),
    status: 'approved',
  });

  useEffect(() => {
    getUserData();
    if (addmodal == false) {
      getInventory();
    }
  }, [addmodal]);

  // METHOD FOR FETCHING USER_DETAILS
  const getUserData = async () => {
    try {
      setLoader(true);
      let userdata = await getObjByKey('loginResponse');
      setUserdata(userdata);
    } catch (error) {
      console.error('ERROR: GETTING_USER_DATA', error);
      setLoader(false);
    } finally {
      setLoader(false);
    }
  };

  // FETCHING ALL THE INVENTORY PRODUCTS
  const getInventory = async () => {
    console.log('getIntentory');
    try {
      setLoader(true);
      let inventory = await getObjByKey('inventory');
      console.log('Data retrieved:', inventory);
      setInventory(inventory);
    } catch (error) {
      console.error('ERROR: GETTING_USER_DATA', error);
      setLoader(false);
    } finally {
      setLoader(false);
    }
  };

  // BACKHANDLING
  useFocusEffect(() => {
    const backAction = () => {
      Alert.alert('', 'Are you sure you want to exit app ?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  // METHOD FOR LOGOUT
  const logoutUser = async () => {
    Alert.alert('Logout', 'Are you sure, do you want to logout ?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {
        text: 'Yes',
        onPress: async () => {
          await AsyncStorage.removeItem('loginResponse').then(() => {
            dispatch(checkuserToken());
          });
        },
      },
    ]);
  };

  // METHOD TO MAKE ADD PRODUCT MODAL VISIBLE
  const addProductVisible = () => {
    console.log('add products');
    setaddModal(true);
  };

  // METHOD FOR ADDING PRODUCT AND SYNCING TO ASYNC STORAGE
  const addProduct = async item => {
    setLoader(true);
    try {
      console.log('------>', {...staticData, ...item});
      products = [...inventory, {...staticData, ...item}];
      setInventory([...inventory, {...staticData, ...item}]);
      storeObjByKey('inventory', products);
    } catch (error) {
      Alert.alert('ERROR_ADDING_PRODUCT');
      setLoader(false);
    } finally {
      setLoader(false);
      setaddModal(false);
      resetFields();
    }
  };

  // METHOD FOR UPDATING THE PRODUCT AND SYNCING TO ASYNC STORAGE
  const updateProduct = async item => {
    setLoader(true);
    try {
      // THIS PARTICULAR ITEM IS DELETED FROM THE ARRAY
      let updatedItems = inventory.filter((element, index) => {
        return element.pid != item.pid;
      });
      // ADDING UPDATED ITEMS LIST AND ITEM TO THE ARRAY
      console.log('full OBJECT---->', [
        {...item, ...staticData},
        ...updatedItems,
      ]);
      setInventory([{...item, ...staticData}, ...updatedItems]);
      storeObjByKey('inventory', products);
      Alert.alert('UPDATED_PRODUCT_DETAILS_SUCCESSFULLY');
    } catch (error) {
      Alert.alert('ERROR_ADDING_PRODUCT', error);
      setLoader(false);
    } finally {
      setLoader(false);
      seteditmodalModal(false);
      resetFields();
    }
  };

  // RESETTING FIELDS AFTER SUCCESSFULL UPDATION AND ON EDIT MODAL REQUEST CLOSE
  const resetFields = () => {
    setPid('');
    setPname('');
    setMrp('');
    setBatchno('');
    setQuantity('');
  };

  // METHOD FOR DELETING PRODUCT AND SYNCING TO ASYNC STORAGE
  const deleteProduct = async (item, type) => {
    setLoader(true);
    try {
      let products = inventory.filter((element, index) => {
        return element.pid != item.pid;
      });
      console.log(products);
      setInventory(products);
      storeObjByKey('inventory', products);
      if (type == 'reject') {
        Alert.alert('REJECTED_PRODUCT_SUCCESSFULLY');
      } else {
        Alert.alert('DELETED_PRODUCT_SUCCESSFULLY');
      }
    } catch (error) {
      Alert.alert('ERROR_DELETING_PRODUCT');
      setLoader(false);
    } finally {
      setLoader(false);
    }
  };

  const approveProduct = async item => {
    setLoader(true);
    try {
      let products = inventory.map(element => {
        if (element.pid === item.pid) {
          return {...element, status: 'approved'};
        }
        return element;
      });
      console.log(products);
      setInventory(products);
      storeObjByKey('inventory', products);
      Alert.alert('APPROVED_PRODUCT_SUCCESSFULLY');
    } catch (error) {
      Alert.alert('ERROR_DELETING_PRODUCT');
      setLoader(false);
    } finally {
      setLoader(false);
    }
  };

  // FLATLIST VIEW IN WHICH PRODUCTS ARE SHOWN ALONG WITH EDIT DELETE AND APPROVE BUTTON
  const inventoryView = ({item}) => {
    return (
      <View
        style={{
          ...styles.inventoryView,
        }}>
        <View style={styles.detailContainer}>
          <Text style={styles.title}>{item.pname}</Text>
          <Text style={styles.detailText}>Batch Number: {item.batchno}</Text>
          <Text style={styles.detailText}>MRP: ${item.mrp}</Text>
          <Text style={styles.detailText}>Quantity: {item.quantity}</Text>
          {/* <Text style={styles.detailText}>Status: {item.status}</Text> */}
          <Text style={styles.detailText}>Vendor: {item.vendor}</Text>
          {/* <Text style={styles.detailText}>Batch Date: {item.batchdate}</Text> */}
        </View>
        <View
          style={{
            ...styles.optionsView,
          }}>
          {item.status == 'approved' ? (
            <>
              <TouchableOpacity
                onPress={() => {
                  seteditmodalModal(true);
                  setPid(item.pid);
                  setPname(item.pname);
                  setBatchno(item.batchno);
                  setMrp(item.mrp);
                  setQuantity(item.quantity);
                }}
                style={{
                  ...styles.optionsBtns,
                  backgroundColor: BRANDBLUE,
                }}>
                <Text
                  style={{
                    color: WHITE,
                    fontWeight: 'bold',
                  }}>
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  deleteProduct(item);
                }}
                style={{
                  ...styles.optionsBtns,
                  backgroundColor: RED,
                }}>
                <Text
                  style={{
                    color: WHITE,
                    fontWeight: 'bold',
                  }}>
                  Delete
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => {
                  approveProduct(item);
                }}
                style={{
                  ...styles.optionsBtns,
                  backgroundColor: GREEN,
                }}>
                <Text
                  style={{
                    color: WHITE,
                    fontWeight: 'bold',
                  }}>
                  Approve
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  deleteProduct(item, 'reject');
                }}
                style={{
                  ...styles.optionsBtns,
                  backgroundColor: RED,
                }}>
                <Text
                  style={{
                    color: WHITE,
                    fontWeight: 'bold',
                  }}>
                  Reject
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  };

  return (
    <React.Fragment>
      <MyStatusBar backgroundColor={WHITE} barStyle={'dark-content'} />
      <Loader visible={loader} />
      {/* ADD_PRODUCT MODAL */}
      <Modal
        visible={addmodal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          setaddModal(false);
        }}>
        <MyStatusBar backgroundColor={WHITE} barStyle={'dark-content'} />
        <Loader visible={loader} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              width: WIDTH,
              height: HEIGHT,
              // backgroundColor: `rgba(100, 100, 100, 0.4)`,
              backgroundColor: WHITE,
              alignSelf: 'center',
              alignItems: 'center',
            }}>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={pid}
                title="Product ID"
                placeholder="Enter Product ID"
                width="94%"
                onChangeText={setPid}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={pname}
                title="Product Name"
                placeholder="Enter Product Name"
                width="94%"
                onChangeText={setPname}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={batchno}
                title="Batch Number"
                placeholder="Enter Batch Number"
                width="94%"
                onChangeText={setBatchno}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={mrp}
                title="MRP"
                placeholder="Enter Product MRP"
                width="94%"
                onChangeText={setMrp}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={quantity}
                title="Product Quantity"
                placeholder="Enter Product Quantity"
                width="94%"
                onChangeText={setQuantity}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                addProduct({
                  pid: pid,
                  pname: pname,
                  mrp: mrp,
                  batchno: batchno,
                  quantity: quantity,
                });
              }}
              style={{
                ...styles.addProductBtn,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: BLACK,
                }}>
                Add Product
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      {/* ADD_PRODUCT MODAL END */}
      {/* EDIT_PRODUCT MODAL */}
      <Modal
        visible={editmodal}
        transparent={true}
        animationType="fade"
        statusBarTranslucent
        onRequestClose={() => {
          seteditmodalModal(false);
          resetFields();
        }}>
        <MyStatusBar backgroundColor={WHITE} barStyle={'dark-content'} />
        <Loader visible={loader} />
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            style={{
              width: WIDTH,
              height: HEIGHT,
              // backgroundColor: `rgba(100, 100, 100, 0.4)`,
              backgroundColor: WHITE,
              alignSelf: 'center',
              alignItems: 'center',
            }}>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                editable={false}
                value={pid}
                title="Product ID"
                placeholder="Enter Product ID"
                width="94%"
                onChangeText={setPid}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={pname}
                title="Product Name"
                placeholder="Enter Product Name"
                width="94%"
                onChangeText={setPname}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={batchno}
                editable={false}
                title="Batch Number"
                placeholder="Enter Batch Number"
                width="94%"
                onChangeText={setBatchno}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={mrp}
                title="MRP"
                placeholder="Enter Product MRP"
                width="94%"
                onChangeText={setMrp}
              />
            </View>
            <View style={{...styles.textInputContainer}}>
              <TextInputName
                value={quantity}
                title="Product Quantity"
                placeholder="Enter Product Quantity"
                width="94%"
                onChangeText={setQuantity}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                updateProduct({
                  pid: pid,
                  pname: pname,
                  mrp: mrp,
                  batchno: batchno,
                  quantity: quantity,
                });
              }}
              style={{
                ...styles.addProductBtn,
              }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: 'bold',
                  color: BLACK,
                }}>
                Update Product
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Modal>
      <View
        style={{
          ...styles.container,
        }}>
        {/* HEADER_VIEW */}
        <View
          style={{
            ...styles.header,
          }}>
          <View
            style={{
              width: '25%',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
            }}>
            <Image
              tintColor={BLACK}
              resizeMode={'contain'}
              style={{
                width: '90%',
                borderRadius: 100,
              }}
              source={PROFILE}
            />
            <TouchableOpacity
              onPress={() => {
                logoutUser();
              }}
              style={{
                width: '60%',
                height: 20,
                backgroundColor: TABGRAY,
                borderRadius: 3,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text
                style={{
                  color: WHITE,
                  fontWeight: 'bold',
                }}>
                Logout
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={{
              width: '75%',
              justifyContent: 'center',
            }}>
            <View
              style={{
                padding: 2,
              }}>
              <Text
                style={{
                  ...styles.headerTextStylesHead,
                }}>
                Username:
              </Text>
              <Text
                style={{
                  ...styles.headerTextStyles,
                }}>
                {userdata.username}
              </Text>
            </View>
            <View
              style={{
                padding: 2,
              }}>
              <Text
                style={{
                  ...styles.headerTextStylesHead,
                }}>
                Email:
              </Text>
              <Text
                style={{
                  ...styles.headerTextStyles,
                }}>
                {userdata.email}
              </Text>
            </View>
          </View>
        </View>
        {/* HEADER_VIEW_END */}
        {/* ADD_PRODUCT_BTN */}
        <View
          style={{
            ...styles.addProductsView,
          }}>
          <TouchableOpacity
            style={{
              width: '50%',
              backgroundColor: BRAND,
              borderRadius: 5,
              flexDirection: 'row',
              padding: 4,
            }}
            onPress={() => {
              addProductVisible();
            }}>
            <View
              style={{
                width: '30%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Image
                resizeMode={'cover'}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 100,
                }}
                source={ADD}
              />
            </View>
            <View
              style={{
                height: '100%',
                width: '70%',
                justifyContent: 'center',
              }}>
              <Text
                style={{
                  fontSize: 19,
                  fontWeight: 'bold',
                  color: BLACK,
                }}>
                Add Product
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* ADD_PRODUCT_BTN END */}
        <ScrollView
          style={{
            ...styles.productListView,
          }}>
          <FlatList data={inventory} renderItem={inventoryView} />
        </ScrollView>
      </View>
    </React.Fragment>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: WHITE,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
  },
  headerTextStyles: {
    fontSize: 16,
    color: BLACK,
  },
  headerTextStylesHead: {
    fontSize: 19,
    fontWeight: 'bold',
    color: BRAND,
  },
  addProductsView: {
    width: '100%',
    height: 80,
    padding: 5,
    justifyContent: 'center',
    paddingLeft: '5%',
  },
  productListView: {
    width: '100%',
    height: '100%',
  },
  inventoryView: {
    width: '95%',
    margin: 2,
    backgroundColor: BRAND,
    alignSelf: 'center',
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: BLACK,
  },
  detailContainer: {
    marginTop: 5,
    width: '70%',
    paddingLeft: '5%',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 14,
    marginBottom: 3,
    color: TABGRAY,
  },
  optionsView: {
    width: '30%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionsBtns: {
    width: '70%',
    backgroundColor: TABGRAY,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 1,
  },
  textInputContainer: {
    width: '90%',
    marginVertical: '2%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addProductBtn: {
    width: '85%',
    marginTop: 16,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8ad42',
    alignItems: 'center',
  },
});

export default Storemanager;