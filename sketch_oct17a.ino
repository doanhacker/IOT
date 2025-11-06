#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <DHT.h>
#include <ArduinoJson.h>

// =================== MQTT CONFIG ===================
const char* mqtt_server = "f0c0b2c8944248e59c03793f5e5ff1d7.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_user = "doanatytbg";
const char* mqtt_password = "Doan123456";
const char* mqtt_topic = "data/sensor";
const char* TOPIC_DEVICE = "device";
const char* TOPIC_HISTORY = "action/history";

// =================== WIFI CONFIG ===================
const char* ssid = "Đoàn204";
const char* password = "12345678";

// =================== HARDWARE CONFIG ===================
#define LED_PIN 12  
#define FAN_PIN 13  
#define AC_PIN 27  
#define CDS_PIN 34
#define DHTPIN 32
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

WiFiClientSecure espClient;
PubSubClient client(espClient);

// API của Node.js để lấy trạng thái gần nhất
const char* STATE_API = "http://192.168.1.100:3001/latest-action-history";  // ⚠️ Đổi IP thành IP máy chạy Node.js

// =================== WIFI CONNECT ===================
void setup_wifi() {
  delay(10);
  Serial.println("🔌 Kết nối WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi đã kết nối!");
  Serial.print("🌐 IP ESP32: ");
  Serial.println(WiFi.localIP());
}

// =================== MQTT RECONNECT ===================
void reconnect() {
  while (!client.connected()) {
    Serial.print("🔁 Kết nối MQTT...");
    String clientID = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientID.c_str(), mqtt_user, mqtt_password)) {
      Serial.println("✅ Kết nối thành công!");
      client.subscribe(TOPIC_DEVICE);
      Serial.println("📩 Đã subscribe topic 'device'");
    } else {
      Serial.print("❌ Thất bại, rc=");
      Serial.print(client.state());
      Serial.println(" → thử lại sau 5s");
      delay(5000);
    }
  }
}

// =================== MAP DEVICE NAME ===================
int getDeviceCode(String device) {
  if (device == "led") return 1;
  if (device == "fan") return 2;
  if (device == "ac") return 3;
  return -1;
}

// =================== MQTT CALLBACK ===================
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("📨 Nhận dữ liệu từ topic: ");
  Serial.println(topic);
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("➡️ Nội dung: ");
  Serial.println(message);

  if (String(topic) == "device") {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);
    if (error) {
      Serial.print("❌ Lỗi JSON: ");
      Serial.println(error.c_str());
      return;
    }

    String device = doc["device"];
    int status = doc["status"];
    int deviceCode = getDeviceCode(device);

    switch (deviceCode) {
      case 1:  // LED
        digitalWrite(LED_PIN, status ? HIGH : LOW);
        Serial.println(status ? "💡 Đèn BẬT" : "💡 Đèn TẮT");
        break;
      case 2:  // FAN
        digitalWrite(FAN_PIN, status ? HIGH : LOW);
        Serial.println(status ? "🌀 Quạt BẬT" : "🌀 Quạt TẮT");
        break;
      case 3:  // AC
        digitalWrite(AC_PIN, status ? HIGH : LOW);
        Serial.println(status ? "❄️ Điều hòa BẬT" : "❄️ Điều hòa TẮT");
        break;
      default:
        Serial.println("⚠️ Thiết bị không hợp lệ");
    }

    // Gửi phản hồi lại server qua MQTT
    String DeviceStatus = "{";
    DeviceStatus += "\"device\":\"" + device + "\",";
    DeviceStatus += "\"status\":" + String(status);
    DeviceStatus += "}";
    client.publish(TOPIC_HISTORY, DeviceStatus.c_str());
    Serial.println("📤 Gửi phản hồi MQTT: " + DeviceStatus);
  }
}

// =================== LẤY TRẠNG THÁI CUỐI TỪ SERVER ===================
void restoreDeviceStateFromServer() {
  HTTPClient http;
  Serial.println("🌍 Đang lấy trạng thái cuối từ server...");

  http.begin(STATE_API);
  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.println("✅ Trạng thái nhận được:");
    Serial.println(payload);

    DynamicJsonDocument doc(512);
    deserializeJson(doc, payload);

    int ledState = doc["led"];
    int fanState = doc["fan"];
    int acState = doc["ac"];

    digitalWrite(LED_PIN, ledState ? HIGH : LOW);
    digitalWrite(FAN_PIN, fanState ? HIGH : LOW);
    digitalWrite(AC_PIN, acState ? HIGH : LOW);

    Serial.println(ledState ? "💡 Đèn bật lại" : "💡 Đèn tắt");
    Serial.println(fanState ? "🌀 Quạt bật lại" : "🌀 Quạt tắt");
    Serial.println(acState ? "❄️ Điều hòa bật lại" : "❄️ Điều hòa tắt");
  } else {
    Serial.println("❌ Không lấy được trạng thái thiết bị từ server!");
  }
  http.end();
}

// =================== SETUP ===================
void setup() {
  Serial.begin(115200);
  setup_wifi();
  dht.begin();
  espClient.setInsecure(); 
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);

  pinMode(LED_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(AC_PIN, OUTPUT);

  delay(2000);
  restoreDeviceStateFromServer();  // 🟢 khôi phục trạng thái từ server sau khi kết nối
}

// =================== LOOP ===================
void loop() {
  if (!client.connected()) reconnect();
  client.loop();

  float h = random(400, 900) / 10.0;
  float t = random(200, 350) / 10.0;

  if (isnan(h) || isnan(t)) {
    Serial.println("⚠️ Lỗi đọc DHT22!");
    return;
  }

  float adcValue = 4095 - analogRead(CDS_PIN);
  float voltage = adcValue * 3.3 / 4095.0;
  const float R_FIXED = 10000.0;
  float resistanceLDR = (3.3 - voltage) * R_FIXED / voltage;
  float lux = 500.0 / (resistanceLDR / 1000.0);

  // JSON cảm biến
  String DataSensor = "{";
  DataSensor += "\"temperature\":" + String(t) + ",";
  DataSensor += "\"humidity\":" + String(h) + ",";
  DataSensor += "\"light\":" + String(lux);
  DataSensor += "}";

  client.publish(mqtt_topic, DataSensor.c_str());
  Serial.println("📤 Gửi dữ liệu cảm biến: " + DataSensor);

  delay(3000);
}
