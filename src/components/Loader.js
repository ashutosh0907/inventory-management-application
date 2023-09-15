import React from "react";
import { Image, Modal, Pressable, ScrollView, View } from "react-native";
import { HEIGHT, MyStatusBar } from "../constants/config";
import { EMI_LOADER, LOADER } from "../constants/imagepath";
import { WHITE } from "../constants/color";

export const Loader = ({
  visible = false,
  onBackPress,
  imageStyle,
  source,
  backgroundColor = `rgba(100, 100, 100, 0.5)`,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      // animationType='slide'
      statusBarTranslucent
      onRequestClose={() => onBackPress != undefined && onBackPress(false)}
    >
      <Pressable

        style={{
          flex: 1,
          justifyContent: 'center',
          backgroundColor: WHITE,
          alignItems: 'center'
        }}>
        <MyStatusBar barStyle={'dark-content'} />

        <Image
          style={{
            height: 130,
            width: 130
          }}
          source={LOADER}
        />
      </Pressable>
    </Modal>
  )
}
