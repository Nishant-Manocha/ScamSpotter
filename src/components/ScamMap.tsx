import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Text,
} from "react-native";
import MapView, { Marker, Callout } from "react-native-maps";
import API from "../api/api";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const ScamMap: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        setReports(res.data);
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filtered reports based on search, type, and time
  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.contactInfo?.toLowerCase().includes(search.toLowerCase()) ||
        report.description?.toLowerCase().includes(search.toLowerCase());

      const matchesType =
        selectedType === "all" || report.type === selectedType;

      let matchesTime = true;
      if (timeRange !== "all") {
        const reportDate = new Date(report.createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - reportDate.getTime()) / 36e5;
        if (timeRange === "24h") matchesTime = diffHours <= 24;
        else if (timeRange === "7d") matchesTime = diffHours <= 168;
        else if (timeRange === "30d") matchesTime = diffHours <= 720;
      }

      return matchesSearch && matchesType && matchesTime;
    });
  }, [reports, search, selectedType, timeRange]);

  const renderMarkerIcon = (type: string) => {
    switch (type) {
      case "phishing":
        return <MaterialIcons name="email" size={28} color="red" />;
      case "card-fraud":
        return <FontAwesome5 name="credit-card" size={26} color="blue" />;
      case "ponzi":
        return <FontAwesome5 name="coins" size={26} color="orange" />;
      case "romance":
        return <Ionicons name="heart" size={28} color="pink" />;
      case "tax-fraud":
        return <FontAwesome5 name="file-invoice-dollar" size={26} color="purple" />;
      case "student-loan":
        return <Ionicons name="school" size={28} color="green" />;
      default:
        return <Ionicons name="alert-circle" size={28} color="gray" />;
    }
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Filters Section */}
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search phone/email/URL..."
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Fraud Type</Text>
          <Picker
            selectedValue={selectedType}
            onValueChange={setSelectedType}
            style={styles.picker}
          >
            <Picker.Item label="All Types" value="all" />
            <Picker.Item label="Phishing" value="phishing" />
            <Picker.Item label="Credit Card Fraud" value="card-fraud" />
            <Picker.Item label="Ponzi Scheme" value="ponzi" />
            <Picker.Item label="Romance Scam" value="romance" />
            <Picker.Item label="Tax Fraud" value="tax-fraud" />
            <Picker.Item label="Student Loan" value="student-loan" />
          </Picker>
        </View>
        <View style={styles.pickerWrapper}>
          <Text style={styles.label}>Time Range</Text>
          <Picker
            selectedValue={timeRange}
            onValueChange={setTimeRange}
            style={styles.picker}
          >
            <Picker.Item label="All Time" value="all" />
            <Picker.Item label="Last 24 Hours" value="24h" />
            <Picker.Item label="Last 7 Days" value="7d" />
            <Picker.Item label="Last 30 Days" value="30d" />
          </Picker>
        </View>
      </View>

      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: filteredReports[0]?.latitude || 20.5937,
          longitude: filteredReports[0]?.longitude || 78.9629,
          latitudeDelta: 5,
          longitudeDelta: 5,
        }}
      >
        {filteredReports.map((report, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
          >
            {renderMarkerIcon(report.type)}
            <Callout>
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Ionicons name="warning" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.cardTitle}>{report.type}</Text>
                </View>
                <Text style={styles.cardAddress}>{report.address}</Text>
                <Text style={styles.cardDesc}>{report.description}</Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreLabel}>Reported By:</Text>
                  <Text style={styles.contact}>{report.contactInfo}</Text>
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  map: { flex: 1 },
  filterContainer: {
    backgroundColor: "#fff",
    padding: 10,
    elevation: 3,
  },
  searchInput: {
    backgroundColor: "#f2f2f2",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  pickerWrapper: { marginBottom: 8 },
  label: { fontWeight: "bold", fontSize: 14, marginBottom: 2 },
  picker: {
    backgroundColor: "#f2f2f2",
    borderRadius: 8,
  },
  card: {
    width: 220,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    backgroundColor: "#dc3545",
    padding: 5,
    borderRadius: 6,
    marginBottom: 6,
    alignItems: "center",
  },
  cardTitle: { color: "#fff", fontWeight: "bold", fontSize: 15 },
  cardAddress: { fontSize: 13, color: "#555", marginBottom: 4 },
  cardDesc: { fontSize: 12, color: "#777", marginBottom: 6 },
  scoreContainer: { flexDirection: "row", alignItems: "center" },
  scoreLabel: { fontSize: 12, color: "#555", marginRight: 4 },
  contact: { fontSize: 12, color: "#007BFF", fontWeight: "600" },
});

export default ScamMap;
