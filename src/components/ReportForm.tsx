import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  FlatList,
} from "react-native";
import API from "../api/api";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";
import axios from "axios";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";

const SCAM_TYPES = [
  { label: "Phishing Attack", value: "phishing" },
  { label: "Credit Card Fraud", value: "card-fraud" },
  { label: "Ponzi Scheme", value: "ponzi" },
  { label: "Romance Scam", value: "romance" },
  { label: "Tax Fraud", value: "tax-fraud" },
  { label: "Student Loan Scam", value: "student-loan" },
];

const ReportForm: React.FC = () => {
  const [type, setType] = useState("");
  const [description, setDescription] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [predictions, setPredictions] = useState<any[]>([]);
  const [location, setLocation] = useState({ latitude: 0, longitude: 0 });

  const apiKey = "AlzaSyOXk2Nx6XoKFqyR_rbE3EHEkvB0d24C3RV";

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Location permission is required to report a scam.");
      }
    })();
  }, []);

  // Autocomplete
  const fetchPredictions = async (text: string) => {
    setAddress(text);
    if (text.length < 3) {
      setPredictions([]);
      return;
    }
    try {
      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/autocomplete/json`,
        { params: { input: text, key: apiKey } }
      );
      if (res.data.predictions) setPredictions(res.data.predictions);
    } catch (error) {
      console.error("Autocomplete Error:", error);
    }
  };

  // Select suggestion
  const selectPrediction = async (placeId: string, description: string) => {
    setAddress(description);
    setPredictions([]);
    try {
      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/place/details/json`,
        { params: { place_id: placeId, key: apiKey } }
      );
      const loc = res.data.result.geometry.location;
      setLocation({ latitude: loc.lat, longitude: loc.lng });

      const cityComp = res.data.result.address_components.find((c: any) =>
        c.types.includes("locality")
      );
      setCity(cityComp ? cityComp.long_name : "");
    } catch (error) {
      Alert.alert("Error", "Failed to fetch location details");
    }
  };

  // Detect location
  const useCurrentLocation = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });

      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/geocode/json?latlng=${loc.coords.latitude},${loc.coords.longitude}&key=${apiKey}`
      );

      if (res.data.results.length > 0) {
        const addressData = res.data.results[0];
        setAddress(addressData.formatted_address);
        const cityComp = addressData.address_components.find((c: any) =>
          c.types.includes("locality")
        );
        setCity(cityComp ? cityComp.long_name : "");
      } else {
        setAddress("Detected but address not found");
      }

      setPredictions([]);
    } catch (error) {
      Alert.alert("Error", "Unable to fetch current location");
    }
  };

  // Validate address manually
  const checkAddressLocation = async () => {
    if (!address) {
      Alert.alert("Error", "Please enter an address");
      return;
    }
    try {
      const res = await axios.get(
        `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
      );
      if (res.data.status === "OK" && res.data.results.length > 0) {
        const loc = res.data.results[0].geometry.location;
        setLocation({ latitude: loc.lat, longitude: loc.lng });

        const cityComp = res.data.results[0].address_components.find((c: any) =>
          c.types.includes("locality")
        );
        setCity(cityComp ? cityComp.long_name : "");
        Alert.alert("Success", "Address validated!");
      } else {
        Alert.alert("Error", "Address not found");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to validate address");
    }
  };

  const handleReset = () => {
    setAddress("");
    setCity("");
    setPredictions([]);
    setLocation({ latitude: 0, longitude: 0 });
  };

  // Submit form
  const handleSubmit = async () => {
    if (!type || !description || !contactInfo || !address) {
      Alert.alert("Error", "All fields including address are required");
      return;
    }
    try {
      await API.post("/reports", {
        type,
        description,
        contactInfo,
        address,
        city,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert("Success", "Scam report submitted!");
      setType("");
      setDescription("");
      setContactInfo("");
      handleReset();
    } catch (error) {
      Alert.alert("Error", "Failed to submit report");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Report a Scam</Text>

      <Text style={styles.label}>Scam Type</Text>
      <Picker
        selectedValue={type}
        onValueChange={(itemValue) => setType(itemValue)}
        style={styles.input}
      >
        <Picker.Item label="Select Scam Type" value="" />
        {SCAM_TYPES.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Describe the scam..."
        value={description}
        onChangeText={setDescription}
      />

      <Text style={styles.label}>Your Contact Info</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone or Email"
        value={contactInfo}
        onChangeText={setContactInfo}
      />

      <Text style={styles.label}>Address</Text>
      <View style={styles.addressContainer}>
        <TextInput
          style={styles.inputAddress}
          placeholder="Search or enter address..."
          value={address}
          onChangeText={fetchPredictions}
        />
        {address.length > 0 && (
          <TouchableOpacity style={styles.crossBtn} onPress={handleReset}>
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.iconButton} onPress={checkAddressLocation}>
          <FontAwesome5 name="search" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {predictions.length > 0 && (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.place_id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.predictionItem}
              onPress={() => selectPrediction(item.place_id, item.description)}
            >
              <Text>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity style={styles.detectBtn} onPress={useCurrentLocation}>
        <Ionicons name="locate" size={20} color="white" />
        <Text style={styles.detectBtnText}> Detect My Location</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
        <FontAwesome5 name="paper-plane" size={18} color="white" />
        <Text style={styles.submitText}> Submit Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 24, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  label: { fontSize: 16, marginTop: 10 },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },
  inputAddress: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  crossBtn: {
    backgroundColor: "#dc3545",
    padding: 10,
    marginLeft: 5,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    marginLeft: 5,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  predictionItem: {
    backgroundColor: "#fff",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detectBtn: {
    flexDirection: "row",
    backgroundColor: "#17a2b8",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  detectBtnText: { color: "white", fontWeight: "bold", marginLeft: 5 },
  submitBtn: {
    flexDirection: "row",
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  submitText: { color: "white", fontWeight: "bold", fontSize: 16, marginLeft: 5 },
});

export default ReportForm;
