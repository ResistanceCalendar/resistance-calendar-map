<template>
    <div>
        <div class="alert alert-danger" v-if="error">There was an error importing from the chosen URL</div>
        <div class="row form-group">
                <div class="col-xs-12">
                    <ul class="nav nav-pills nav-justified thumbnail setup-panel">
                        <li :class="{'active': step == 1}" @click="step = 1"><a href="#">
                            <h4 class="list-group-item-heading">Step 1</h4>
                            <p class="list-group-item-text">Select a format <span v-if="type">({{type}})</span></p>
                        </a></li>
                        <li :class="{'active': step == 2}" @click="step = 2"><a href="#">
                            <h4 class="list-group-item-heading">Step 2</h4>
                            <p class="list-group-item-text">Import source</p>
                        </a></li>
                        <li :class="{'active': step == 3}"><a href="#">
                            <h4 class="list-group-item-heading">Step 3</h4>
                            <p class="list-group-item-text">Import</p>
                        </a></li>
                    </ul>
                </div>
            </div>
        <div v-if="step == 1">
            <button class="btn btn-info" @click="setType('OSDI')">OSDI</button>
        </div>
        <div v-if="step == 2">
            <div class="input-group">
                <input type="text" class="form-control" placeholder="API URL" v-model="url">
                <div class="input-group-btn">
                    <button type="button" class="btn btn-primary" @click="nextStep()">Next</button>
                </div>
                <!-- /btn-group -->
            </div>
        </div>
        <div v-if="step == 3">
            <div v-if="!loading">
                <button class="btn btn-info" @click="submitForm(true)">Truncate &amp; import</button>
                <button class="btn btn-info" @click="submitForm(false)">Don't truncate</button>
            </div>
            <div v-else style="text-align: center;">
                <i class="fa fa-refresh fa-spin fa-5x"></i>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                step: 1,
                url: '',
                type: '',
                loading: false,
                error: false
            }
        },
        methods: {
            setType (type) {
                this.type = type
                this.step++
            },
            nextStep () {
                if(this.url != '') {
                    this.step++
                }
            },
            submitForm (truncate) {
                this.loading = true
                axios.post('/import/' + this.type, {'url': this.url, 'truncate': truncate}).then(function(response) {
                    console.log(response)
                    location.reload()
                }).catch(function(error) {
                    this.loading = false
                    this.error = true
                }.bind(this))
            }
        }
    };
</script>
