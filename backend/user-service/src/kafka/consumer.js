const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: "user-service" });

const runConsumer = async () => {

  await consumer.connect();

  await consumer.subscribe({ topic: "BOOK_BORROWED" });

  await consumer.run({
    eachMessage: async ({ topic, message }) => {

      const data = JSON.parse(message.value.toString());

      console.log("User Service received event:", data);

    }
  });

};

module.exports = runConsumer;