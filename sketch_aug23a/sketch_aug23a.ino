#include <WiFi.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>
#include <DHT.h>
#include <ArduinoJson.h>

// MQTT Broker
const char* mqtt_server = "1b960938869f4e2f93e368cbe2a8504d.s1.eu.hivemq.cloud";  // đổi host
const int mqtt_port = 8883;                                                       // giữ nguyên
const char* mqtt_user = "trung";
const char* mqtt_password = "123456789aA";

const char* mqtt_topic = "data/sensor";  // giữ nguyên topic
const char* TOPIC_DEVICE = "device";     // chỉ sub topic này
const char* topic_start = "esp32/start";
// action/history
WiFiClientSecure espClient;
PubSubClient client(espClient);
// WiFi
const char* ssid = "Doan204";
const char* password = "12345678";


//LED
#define LED_PIN 14  //GPOP14
#define FAN_PIN 13  // GPI13
#define AC_PIN 27
#define WARNING_PIN 2

// DHT22
#define DHTPIN 5  // GPIO12
#define DHTTYPE DHT11
DHT dht(DHTPIN, DHTTYPE);
//TOPIC nhận tín hiệu đèn

//CDS
#define CDS_PIN 34

void setup_wifi() {
  delay(10);
  Serial.println("Kết nối WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n WiFi đã kết nối!");
  Serial.print("IP ESP32: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  // Loop cho đến khi kết nối lại thành công
  while (!client.connected()) {
    Serial.print("Đang kết nối MQTT...");
    String clientID = "ESP32Client-" + String(random(0xffff), HEX);
    if (client.connect(clientID.c_str(), mqtt_user, mqtt_password)) {  //  client ID riêng
      Serial.println("Thành công!");
      String begin = "{\"status\" : 1}";
      client.publish("esp32/start", begin.c_str());
      client.subscribe(TOPIC_DEVICE);
      Serial.println("Đã subcribe topic 'device'");
    } else {
      Serial.print("Thất bại, rc=");
      Serial.print(client.state());
      Serial.println(" → thử lại sau 5s");
      delay(5000);
    }
  }
}
//hàm lấy thiết bị
int getDeviceCode(String device) {
  if (device == "led") return 1;
  if (device == "fan") return 2;
  if (device == "ac") return 3;
  if (device == "warning") return 4;
  return -1;  // thiết bị không hợp lệ
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Nhận dữ liệu từ topic: ");
  Serial.println(topic);
  String message;
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  Serial.print("Nội dung: ");
  Serial.println(message);
  // Xử lý nếu nhận dữ liệu từ topic "device"
  if (String(topic) == "device") {
    StaticJsonDocument<200> doc;
    DeserializationError error = deserializeJson(doc, message);
    if (error) {
      Serial.print("Lỗi phân tích JSON: ");
      Serial.println(error.c_str());
      return;
    }
    String device = doc["device"];
    int status = doc["status"];
    int deviceCode = getDeviceCode(device);

    switch (deviceCode) {
      case 1:  // LED
        if (status == 1) {
          digitalWrite(LED_PIN, HIGH);
          Serial.println("Đèn BẬT");
        } else if (status == 0) {
          digitalWrite(LED_PIN, LOW);
          Serial.println("Đèn TẮT");
        } else {
          Serial.println("Trạng thái đèn không hợp lệ");
        }
        break;
      case 2:  // FAN
        if (status == 1) {
          Serial.println("Quạt BẬT");
          digitalWrite(FAN_PIN, HIGH);
        } else if (status == 0) {
          Serial.println("Quạt TẮT");
          digitalWrite(FAN_PIN, LOW);
        } else {
          Serial.println("Trạng thái điều quạt không hợp lệ");
        }
        break;

      case 3:  //AC
        if (status == 1) {
          Serial.println("Điều hòa BẬT");
          digitalWrite(AC_PIN, HIGH);
        } else if (status == 0) {
          digitalWrite(AC_PIN, LOW);
          Serial.println("Điều hòa ta TẮT");
        } else {
          Serial.println("Trạng thái điều hòa không hợp lệ");
        }
        break;
      //cảnh báo
      case 4:
        if (status == 1) {
          Serial.println("Cảnh báo bật");
          digitalWrite(WARNING_PIN, HIGH);
        } else if (status == 0) {
          digitalWrite(WARNING_PIN, LOW);
          Serial.println("Cảnh báo TẮT");
        } else {
          Serial.println("Trạng thái cảnh báo  không hợp lệ");
        }
        break;
    }
    String DeviceStatus = "{";
    DeviceStatus += "\"device\":\"";
    DeviceStatus += device;
    DeviceStatus += "\",";
    DeviceStatus += "\"status\":";
    DeviceStatus += String(status);
    DeviceStatus += "}";
    Serial.print("Gửi MQTT: ");
    Serial.println(DeviceStatus);
    if (deviceCode == 4) {
      return;
    }
    if (!doc.containsKey("action")) {
      client.publish("action/history", DeviceStatus.c_str());  // gửi lên topic riêng
    }
  }
}

void TaskDevice(void* pvParameters) {
  for (;;) {
    if (!client.connected()) reconnect();
    client.loop();                        // xử lý callback MQTT
    vTaskDelay(10 / portTICK_PERIOD_MS);  // delay nhỏ để nhường CPU
  }
}

void TaskSensor(void* pvParameters) {
  for (;;) {
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    float dust = random(0, 100);

    if (isnan(h) || isnan(t)) {
      Serial.println("Lỗi đọc DHT22!");
      return;
    }
    float adcValue = 4095 - analogRead(CDS_PIN);
    float voltage = adcValue * 3.3 / 4095.0;
    const float R_FIXED = 10000.0;
    float resistanceLDR = (3.3 - voltage) * R_FIXED / voltage;
    float lux = 500.0 / (resistanceLDR / 1000.0);

    String DataSensor = "{\"temperature\":" + String(t) + ",\"humidity\":" + String(h) + ",\"light\":" + String(lux) + ",\"dust\":" + String(dust) + "}";
    client.publish(mqtt_topic, DataSensor.c_str());
    vTaskDelay(3000 / portTICK_PERIOD_MS);  // gửi 3s/lần
  }
}



void setup() {
  Serial.begin(115200);
  setup_wifi();
  dht.begin();
  espClient.setInsecure();  // bỏ kiểm tra chứng chỉ TLS
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  pinMode(LED_PIN, OUTPUT);
  pinMode(FAN_PIN, OUTPUT);
  pinMode(AC_PIN, OUTPUT);
  pinMode(WARNING_PIN, OUTPUT);
  // Tạo 2 task song song
  xTaskCreate(TaskDevice, "DeviceTask", 4096, NULL, 1, NULL);
  xTaskCreate(TaskSensor, "SensorTask", 4096, NULL, 1, NULL);
}






void loop() {
  // if (!client.connected()) {
  //   reconnect();
  // }
  // client.loop();
  // float h = dht.readHumidity();
  // float t = dht.readTemperature();
  // float dust = random(0, 100);

  // if (isnan(h) || isnan(t)) {
  //   Serial.println("Lỗi đọc DHT22!");
  //   return;
  // }
  // //chuyển dổi sang lux
  // float adcValue = 4095 - analogRead(CDS_PIN);
  // float voltage = adcValue * 3.3 / 4095.0;  // Chuyển sang Volt
  // const float R_FIXED = 10000.0;
  // float resistanceLDR = (3.3 - voltage) * R_FIXED / voltage;
  // float lux = 500.0 / (resistanceLDR / 1000.0);
  // //đóng gói dữ liệu
  // String DataSensor = "{";
  // DataSensor += "\"temperature\":";
  // DataSensor += String(t);
  // DataSensor += ",";
  // DataSensor += "\"humidity\":";
  // DataSensor += String(h);
  // DataSensor += ",";
  // DataSensor += "\"light\":";
  // DataSensor += String(lux);
  // DataSensor += ",";
  // DataSensor += "\"dust\":";
  // DataSensor += String(dust);
  // DataSensor += "}";
  // Serial.print("Gửi MQTT: ");
  // Serial.println(DataSensor);
  // //pub dữ liệu lên topic data/sensor
  // client.publish(mqtt_topic, DataSensor.c_str());  // gửi lên topic riêng
  // delay(3000);
}
