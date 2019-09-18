import time
import argparse
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

__RECORDING__ = False


def init():
    client = AWSIoTMQTTClient("arn:aws:iot:us-west-2:443872533066:thing/buzz")
    client.configureEndpoint("ahp00abmtph4i-ats.iot.us-west-2.amazonaws.com", 8883)
    client.configureCredentials("certs/AmazonRootCA1.pem",
                                "certs/5541896cb2-private.pem.key",
                                "certs/5541896cb2-certificate.pem.crt")
    client.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
    client.configureDrainingFrequency(2)  # Draining: 2 Hz
    client.configureConnectDisconnectTimeout(10)  # 10 sec
    client.configureMQTTOperationTimeout(5)  # 5 sec
    return client


def callback(client, userdata, message):
    global __RECORDING__
    print(message.topic, message.payload)
    if message.topic == "picroscope/start":
        __RECORDING__ = True
    elif message.topic == "picroscope/stop":
        __RECORDING__ = False


def start(client):
    client.connect()
    client.subscribe("picroscope/#", 1, callback)
    print("Connected and listening for events...")


def stop(client):
    client.unsubscribe("picroscope/#")
    client.disconnect()
    print("Stopped listening to events and disconnected.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Magic genomic processing black box")
    parser.add_argument("file", nargs="?", help="File to process")
    parser.add_argument("-c", "--count", default=100, required=False,
                        help="Count")
    args = parser.parse_args()

    client = init()
    start(client)

    while True:
        try:
            time.sleep(5)
            if __RECORDING__:
                print("Snap!")
        except KeyboardInterrupt:
            break

    stop(client)
