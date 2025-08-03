import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import API from "../api/api";
import { FontAwesome5, MaterialIcons, Ionicons } from "@expo/vector-icons";

const ReportList: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await API.get("/reports");
        setReports(res.data);
      } catch (error) {
        console.error("Error fetching reports", error);
      }
    };
    fetchReports();
  }, []);

  const renderIcon = (type: string) => {
    switch (type) {
      case "phishing":
        return <MaterialIcons name="email" size={22} color="red" />;
      case "card-fraud":
        return <FontAwesome5 name="credit-card" size={20} color="blue" />;
      case "ponzi":
        return <FontAwesome5 name="coins" size={20} color="orange" />;
      case "romance":
        return <Ionicons name="heart" size={22} color="pink" />;
      case "tax-fraud":
        return <FontAwesome5 name="file-invoice-dollar" size={20} color="purple" />;
      case "student-loan":
        return <Ionicons name="school" size={22} color="green" />;
      default:
        return <Ionicons name="alert-circle" size={22} color="gray" />;
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.icon}>{renderIcon(item.type)}</View>
      <View style={styles.info}>
        <Text style={styles.title}>{item.type}</Text>
        <Text style={styles.desc}>{item.description}</Text>
        <Text style={styles.contact}>📞 {item.contactInfo}</Text>
        <Text style={styles.location}>
          📍 {item.address} {item.city ? `, ${item.city}` : ""}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Submitted Scam Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f9f9f9" },
  heading: { fontSize: 22, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  card: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  icon: { marginRight: 10, justifyContent: "center" },
  info: { flex: 1 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 3 },
  desc: { fontSize: 14, color: "#555" },
  contact: { fontSize: 14, color: "#007BFF", marginTop: 5 },
  location: { fontSize: 12, color: "gray", marginTop: 3 },
});

export default ReportList;
