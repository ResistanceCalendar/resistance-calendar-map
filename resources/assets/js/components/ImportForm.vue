<template>
    <div>
        <div class="alert alert-danger" v-if="error">There was an error importing from the chosen URL</div>
        <div class="input-group">
            <input type="text" class="form-control" placeholder="API URL" v-model="url">
            <div class="input-group-btn">
                <button type="button" class="btn btn-primary dropdown-toggle"
                :class="{ disabled: loading }" data-toggle="dropdown"
                aria-haspopup="true" aria-expanded="false">
                    Import <i class="fa" :class="{ 'fa-caret-down': !loading, 'fa-refresh fa-spin': loading}"></i>
                </button>
                <ul class="dropdown-menu dropdown-menu-right">
                    <li><a href="#" @click="submitForm(true)">Truncate &amp; import</a></li>
                    <li><a href="#" @click="submitForm(false)">Just import</a></li>
                </ul>
            </div>
            <!-- /btn-group -->
        </div>
    </div>
</template>

<script>
    export default {
        data () {
            return {
                url: '',
                loading: false,
                error: false
            }
        },
        methods: {
            submitForm (truncate) {
                this.loading = true
                axios.post('/import', {'url': this.url, 'truncate': truncate}).then(function(response) {
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
