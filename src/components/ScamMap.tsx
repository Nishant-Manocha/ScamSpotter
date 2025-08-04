import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import API from "../api/api";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useReports } from "../context/ReportContext";

const ScamMap: React.FC = () => {
  const { reports, addReport } = useReports(); // ✅ Use context
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [timeRange, setTimeRange] = useState("all");
  const [selectedReport, setSelectedReport] = useState<any>(null);

  // Initial fetch (only once)
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        res.data.forEach((report: any) => addReport(report));
      } catch (error) {
        console.error("Error fetching reports", error);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  // Filtered reports
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

  // Marker icon
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
        return (
          <FontAwesome5 name="file-invoice-dollar" size={26} color="purple" />
        );
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
      {/* Filters */}
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
            key={report._id || index}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            onPress={() => setSelectedReport(report)} // ✅ Show modal
          >
            {renderMarkerIcon(report.type)}
          </Marker>
        ))}
      </MapView>

      {/* Report Modal */}
      <Modal
        visible={!!selectedReport}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedReport(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>
                {selectedReport?.type?.toUpperCase()}
              </Text>
              <Text style={styles.modalLabel}>Description:</Text>
              <Text>{selectedReport?.description}</Text>

              <Text style={styles.modalLabel}>Reported By:</Text>
              <Text>{selectedReport?.contactInfo}</Text>

              <Text style={styles.modalLabel}>Address:</Text>
              <Text>{selectedReport?.address}</Text>

              <Text style={styles.modalLabel}>City:</Text>
              <Text>{selectedReport?.city}</Text>

              <Text style={styles.modalLabel}>Latitude:</Text>
              <Text>{selectedReport?.latitude}</Text>

              <Text style={styles.modalLabel}>Longitude:</Text>
              <Text>{selectedReport?.longitude}</Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedReport(null)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    maxHeight: "70%",
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  modalLabel: { fontWeight: "bold", marginTop: 8 },
  closeButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontWeight: "bold" },
});

export default ScamMap;
