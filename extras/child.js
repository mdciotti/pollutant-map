process.on('message', function (filepath) {
    console.log('Child processing file:', filepath);

    // Do file processing here

    process.send({ completed: filepath });
    process.disconnect();
});

