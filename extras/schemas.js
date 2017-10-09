
MeasurementSchema = new SimpleSchema({
    param: {
        type: Number,
        label: "EPA Parameter Number",
        min: 0
    },
    method: {
        type: Number,
        label: "EPA Method Code",
        min: 0
    },
    poc: {
        type: Number,
        label: "Parameter Occurrence Code",
        min: 0
    },
    units: {
        type: Number,
        label: "EPA Units Code",
        min: 0
    },
    value: {
        type: Number,
        label: "Measurement Value",
        decimal: true
    },
    flag: { // History of flag values, last is most recent
        type: [String],
        label: "TCEQ Flags",
        max: 10
    },
    verified: {
        type: Boolean,
        label: "Human Validated"
    },
    slope: {
        type: Number,
        decimal: true,
        label: "Conversion Rate"
    },
    intercept: {
        type: Number,
        decimal: true,
        label: "Converstion Bias"
    },
    samples: {
        type: Number,
        label: "Number of Samples",
        min: 0
    }
});

TCEQ_Schema = new SimpleSchema({
    epoch: {
        type: String,
        label: "ISO Date and Time"
    },
    site: {
        type: String,
        max: 50,
        label: "Site Identifier",
        regEx: /^\d+_\d+_\d+$/
    },
    measurements: {
        type: [MeasurementSchema]
    }
});
