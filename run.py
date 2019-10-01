import time
import datetime
import glob
import argparse
from AWSIoTPythonSDK.MQTTLib import AWSIoTMQTTClient

__RECORDING__ = False


def init(name):
    client = AWSIoTMQTTClient("arn:aws:iot:us-west-2:443872533066:thing/{}".format(name))
    client.configureEndpoint("ahp00abmtph4i-ats.iot.us-west-2.amazonaws.com", 8883)
    client.configureCredentials("certs/AmazonRootCA1.pem",
                                glob.glob("certs/{}/*-private.pem.key".format(name))[0],
                                glob.glob("certs/{}/*-certificate.pem.crt".format(name))[0])
    client.configureOfflinePublishQueueing(-1)  # Infinite offline Publish queueing
    client.configureDrainingFrequency(2)  # Draining: 2 Hz
    client.configureConnectDisconnectTimeout(10)  # 10 sec
    client.configureMQTTOperationTimeout(5)  # 5 sec
    return client


def callback(client, userdata, message):
    global __RECORDING__
    print(message.topic, message.payload)
    if message.topic.endswith("/start"):
        __RECORDING__ = True
    elif message.topic.endswith("/stop"):
        __RECORDING__ = False


def start(client, name):
    client.connect()
    client.subscribe("{}/#".format(name), 1, callback)
    print("Thing {} and listening for events...".format(name))


def stop(client):
    client.disconnect()
    print("Stopped listening to events and disconnected.")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description="Demo braingeneers processing daemon")
    parser.add_argument("-n", "--name", required=True, help="Thing name")
    args = parser.parse_args()

    client = init(args.name)
    start(client, args.name)

    while True:
        try:
            time.sleep(5)
            if __RECORDING__:
                time_stamp = datetime.datetime.now().isoformat()
                print("Snap @ {}".format(time_stamp))
        except KeyboardInterrupt:
            break

    stop(client)
