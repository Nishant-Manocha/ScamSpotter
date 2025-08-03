import React from "react";
import { Modal, View, Text, StyleSheet, Button } from "react-native";
import { Report } from "../types";

interface Props {
  visible: boolean;
  onClose: () => void;
  report: Report | null;
}

const ReportDetailsModal: React.FC<Props> = ({ visible, onClose, report }) => {
  if (!report) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{report.type.toUpperCase()}</Text>
          <Text>{report.description}</Text>
          <Text>Email: {report.email}</Text>
          <Text>Phone: {report.phone}</Text>
          <Text>Lat: {report.latitude}</Text>
          <Text>Lng: {report.longitude}</Text>
          <Button title="Close" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
});

export default ReportDetailsModal;
