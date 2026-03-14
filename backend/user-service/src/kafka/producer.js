const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

const sendEvent = async (topic, message) => {

  await producer.connect();

  await producer.send({
    topic,
    messages: [
      { value: JSON.stringify(message) }
    ]
  });

};

module.exports = sendEvent;