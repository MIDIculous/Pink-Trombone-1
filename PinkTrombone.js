import WhiteNoise from "/WhiteNoise.js";

class PinkTrombone {
    constructor(audioContext) {
        if(!PinkTrombone.isLoaded)
            throw "Load PinkTrombone First!";

        this.audioContext = audioContext;

        this.whiteNoise = new WhiteNoise(audioContext);
        this.workletNode = new PinkTrombone.WorkletNode(audioContext);

        this.aspirateFilter = audioContext.createBiquadFilter();
            this.aspirateFilter.type = "bandpass";
            this.aspirateFilter.frequency.value = 500;
            this.aspirateFilter.Q.value = 0.5;
                
        this.fricativeFilter = audioContext.createBiquadFilter();
            this.fricativeFilter.type = "bandpass";
            this.fricativeFilter.frequency.value = 1000;
            this.fricativeFilter.Q.value = 0.5;

        [this.aspirateFilter, this.fricativeFilter].forEach(filter => {
            this.whiteNoise.connect(filter).connect(this.workletNode.turbulenceNoise);
        })

        this.whiteNoise.connect(this.workletNode.turbulenceNoise);
    }

    static _Load(audioContext) {
        return audioContext.audioWorklet.addModule("pinkTromboneProcessor.js").then(() => {
            this.isLoaded = true;
        })
    }

    static Load(audioContext) {
        return Promise.all([WhiteNoise.Load(audioContext), this._Load(audioContext)])
    }

    static get WorkletNode() {
        return class extends AudioWorkletNode {
            constructor(audioContext) {
                super(audioContext, "pink-trombone-processor");
                this.parameters.forEach((audioParam, paramName) => {
                    this[paramName] = audioParam;
                })
            }
        }
    }

    get alwaysVoice() {
        return this.workletNode.alwaysVoice.value >= 1;
    }
    set alwaysVoice(newValue) {
        this.workletNode.alwaysVoice.value = newValue? 1:0;
    }

    get alwaysWobble() {
        return this.workletNode.alwaysVoice.value >= 1;
    }
    set alwaysWobble(newValue) {
        this.workletNode.alwaysWobble.value = newValue? 1:0;
    }

    connect(destinationNode, outputIndex, inputIndex) {
        return this.workletNode.connect(...arguments);
    }
    disconnect(destinationNode, outputIndex, inputIndex) {
        return this.workletNode.disconnect(...arguments);
    }

    start() {
        this.whiteNoise.start();
    }
    stop() {
        this.whiteNoise.stop();
    }

    get started() {
        return this.whiteNoise.started;   
    }
}

export default PinkTrombone;