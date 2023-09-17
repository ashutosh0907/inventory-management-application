import { View, Text, FlatList, TouchableOpacity, StatusBar, Image, ScrollView, Pressable, StyleSheet, Alert, BackHandler } from 'react-native'
import React, { useState, useEffect } from 'react'
import { BACKGROUND, BLACK, GRAY, WHITE } from '../constants/color'
import { HEIGHT, MyStatusBar, WIDTH } from '../constants/config'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Card, IconButton, Searchbar } from 'react-native-paper'
import { LOADER, PROFILE } from '../constants/imagepath'
import { Loader } from '../components/Loader'
import LinearGradient from 'react-native-linear-gradient'
import Truckloading from './Truckloading'
import TruckUnloading from './Truckunloading'
import { getObjByKey } from '../utils/Storage'
import CameraOpentoScan from '../components/CameraOpentoScan'
import { useFocusEffect } from '@react-navigation/native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { checkuserToken } from '../redux/actions/auth'
import { useDispatch, } from 'react-redux';


const Home = ({ navigation }) => {
  const dispatch = useDispatch();
  const [page, setPage] = useState(0)
  const [username, setUsername] = useState('user')
  const [loader, setLoader] = useState(false)
  const [scanner, setScanner] = useState(false)
  const [barcodeInNumber, setBarcodeInNumber] = useState('')
  const [barcodeOutNumber, setBarcodeOutNumber] = useState('')

  useFocusEffect(() => {
    const backAction = () => {
      if (scanner == false && page == 0) {
        Alert.alert('', 'Are you sure you want to exit app ?', [
          {
            text: 'Cancel',
            onPress: () => null,
            style: 'cancel',
          },
          { text: 'YES', onPress: () => BackHandler.exitApp() },
        ]);
      }
      else if (scanner == false && page == 1) {
        // setScanner(false)
        setPage(0)
      }
      return true;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  });

  useEffect(() => {
    getUserData();
  }, [])

  const getUserData = async () => {
    let userdata = await getObjByKey('loginResponse');
    console.log(userdata)
    setUsername(userdata.name);
  }

  const showLoader = (boolean) => {
    setLoader(boolean)
  }
  const showScanner = (boolean) => {
    setScanner(boolean)
  }
  const getBarcodeInNumber = (number) => {
    console.log("barcodenumber In NUMBER", number)
    setBarcodeInNumber(number);
  }
  const getBarcodeOutNumber = (number) => {
    console.log("barcodenumber OUT NUMBER", number)
    setBarcodeOutNumber(number);
  }

  return (
    <React.Fragment>
      <MyStatusBar backgroundColor={'#21495f'} barStyle={'light-content'} />
      <Loader visible={loader} />
      {scanner && page == 0 && <CameraOpentoScan showScanner={showScanner} getBarcodeNumber={getBarcodeInNumber} />}
      {scanner && page == 1 && <CameraOpentoScan showScanner={showScanner} getBarcodeNumber={getBarcodeOutNumber} />}
      <LinearGradient
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        colors={['#183a51', 'white',]}
        style={{
          flex: 1
        }}>
        <View style={{ ...styles.profileContainer }}>
          <Pressable
            onPress={() => {
              AsyncStorage.clear().then(() => {
                dispatch(checkuserToken())
                // logoutUser()
              })
            }}
            style={{
              width: '20%',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
            <Image
              tintColor={WHITE}
              style={{
                width: 50,
                height: 50,
              }}
              resizeMode={'contain'}
              source={PROFILE}
            />
          </Pressable>
          <View style={{
            justifyContent: 'center'
          }}>
            <Text style={{ ...styles.helloText }}>
              Hello,
            </Text>
            <Text
              style={{ ...styles.usernameText }}>
              {username} !
            </Text>
          </View>
        </View>

        <View style={{ ...styles.switchContainer }}>
          <View style={{
            ...styles.switchWhiteContainer
          }}>
            <LinearGradient
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              colors={page == 0 ? ['#183a51', '#3b758b',] : ['white', 'white',]}
              style={{ ...styles.inOutContainer }}>
              <Pressable style={{ ...styles.inOutPressable }}
                onPress={() => {
                  setPage(0)
                }}>
                <Text style={{ ...styles.inText, color: page == 0 ? WHITE : BLACK, }}>
                  In
                </Text>
              </Pressable>
            </LinearGradient>

            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              colors={page == 1 ? ['#183a51', '#3b758b',] : ['white', 'white']}
              style={{ ...styles.inOutContainer }}>
              <Pressable
                style={{
                  ...styles.inOutPressable
                }} onPress={() => {
                  setPage(1)
                }}>
                <Text style={{ ...styles.outText, color: page == 1 ? WHITE : BLACK, }}>
                  Out
                </Text>
              </Pressable>
            </LinearGradient>
          </View>
        </View>
        {page == 0 && <Truckloading barcodeinnumber={barcodeInNumber} loader={showLoader} scanner={showScanner} />}
        {page == 1 && <TruckUnloading barcodeoutnumber={barcodeOutNumber} loader={showLoader} scanner={showScanner} />}

      </LinearGradient>
    </React.Fragment>
  )
}

const styles = StyleSheet.create({
  profileContainer: {
    height: '9%',
    width: '100%',
    paddingLeft: 2,
    flexDirection: 'row',
  },
  helloText: {
    color: 'lightgrey',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 10
  },
  usernameText: {
    color: WHITE,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    marginLeft: 10
  },
  switchContainer: {
    width: '100%',
    height: '10%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  switchWhiteContainer: {
    width: '90%',
    height: '70%',
    backgroundColor: WHITE,
    borderRadius: 100,
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center'
  },
  inOutContainer: {
    width: '49%',
    height: '95%',
    borderRadius: 100,
  },
  inOutPressable: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  inText: {
    fontSize: 20,
    fontWeight: 'bold'
  },
  outText: {
    fontSize: 20,
    fontWeight: 'bold'
  }
})

export default Home