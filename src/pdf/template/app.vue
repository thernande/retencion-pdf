<template>
    <div id="home" class="container mt-5">
        <div class="row justify-content-center">
            <div class="col-md-6">
                <div class="card card-body">
                    <div class="form-row mb-2">
                        <div class="col-5">
                            <label for="ano">Año</label>
                            <input type="text" id="ano" v-model="ano" class="form-control " placeholder="Ingrese el año aqui">
                        </div>
                        <div class="col-6">
                            <label for="nit">NIT</label>
                            <input type="text" id="nit" v-model="nit" class="form-control" placeholder="Ingrese su nit aqui"> 
                        </div>
                        <div class="col-12 pt-3">
                            <button class="btn btn-primary col-5" @click.prevent="prevPDF">Buscar</button>
                            <button class="btn btn-primary col-6 down" :disabled="state" @click.prevent="toPdf">Descargar PDF</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- a partir de aqui es la impresion para el pdf -->
        <div class="container" id="capture" ref="capture" v-show="state === false">
            <div>
                <img src="img/logo.jpg">
            </div>
            <div class="row">
                <h2 class="title col">CERTIFICADO DE RETENCIÓN EN LA FUENTE AÑO GRAVABLE {{ ano }}</h2>
            </div>
            <div class="row">
                <p class="col"><strong>Agente Retenedor:</strong>   ABRACOL S.A</p>
            </div>
            <div class="row">
                <p class="col">
                    <strong class="pr-5 mr-5">NIT: </strong>
                    890.911.327-1
                </p>
            </div>
            <div class="row">
                <p class="col"><strong class="mr-5 pr-4">Dirección: </strong> AUTOPISTA NORTE KM 20 GIRARDOTA (ANT)</p>
            </div>
            <div class="pt-5">
                <p><strong class="mr-3">NIT: </strong> {{ nit }}</p>
                <p>{{ proveedor }}</p>
            </div>
            <table class="table table-bordered">
                <thead>
                    <tr>
                        <th class="color">CONCEPTO</th>
                        <th class="color">BASE</th>
                        <th class="color">Tarifa</th>
                        <th class="color">RETENCION</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <th>
                            <p>{{concepto}}</p>
                        </th>
                        <th>
                            <p>{{ baseP }}</p>
                        </th>
                        <th>
                            <p>{{ tarifa }}</p>
                        </th>
                        <th>
                            <p>{{ TOT_monto }}</p>
                        </th>
                    </tr>
                    <tr class="blue">
                        <th></th>
                        <th>{{ baseP }}</th>
                        <th></th>
                        <th>{{ TOT_monto }}</th>
                    </tr>
                    <tr>
                        <th colspan="4">{{ Valor_letra }}</th>
                    </tr>
                </tbody>
            </table>
            <p>Los Valores antes Mencionados fueron declarados y consignados a la dirección de Impuestos y Aduanas nacionales - DIAN, tal como se realaciona a continuación:</p>
            <table class="table table-bordered">
                <thead>
                    <tr class="color">
                        <th>
                            <p>Periodo Retención</p>
                        </th>
                        <th>
                            <p>Fecha Declaración Pago</p>
                        </th>
                        <th>
                            <p>Ciudad y Folio Pago</p>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="table in tables" :key="table.Nit"> <!-- aui va un for de vue para llenar los datos-->
                        <td>
                            <p>{{ table.FiscalYear }} / {{ table.FiscalPeriod }}</p>
                        </td>
                        <td>
                            <p>{{ table.Fecha_Declaración }}</p>
                        </td>
                        <td>
                            <p>{{ table.Ciudad }} / {{ table.Folio }}</p>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p class="pt-4">Consignados en la Administración de Impuestos de MEDELLIN. El presente Certificado se expide Únicamente para efectos tributarios</p>
            <p class="pt-4 center">EXPEDIDO: GIRARDOTA, 1/31/2020</p>
            <p class="center">CERTIFICADO DE RETENCION EN LA FUENTE</p>
            <p class="pt-5 mt-5 center">Firma: ______________________________________</p>
        </div>
    </div>    
</template>

<script>
    // 71578805
    export default {

        data(){
            return{
                proveedor:'',
                concepto:'',
                ano: '',
                nit: '',
                URL: 'http://10.1.1.35:3002/API/customer/GetLisTByName',
                baseP: '',
                tarifa: '',
                TOT_monto: '',
                Valor_letra: '',
                tables: '',
                state: true
            }
        },

        methods:
        {
            pendingTask: function(){

                
                // GET /someUrl
                this.$http.post('http://10.1.1.45:3002/TASK/pendingTask',{
                    usr: 'afc'
                },{ timeout: 50 })
                .then((response) => {




                })
                .catch((e)=>{

                    this.error = e
                    console.log(e)
                })

            },

            prevPDF(){
                this.$http.post('http://localhost:3002/retencion/', {
                    ano : this.ano,
                    nit : this.nit
                })
                    .then((response) =>{
                        var doc = new jsPDF();
                        console.log(response.body);
                        this.proveedor = response.body.data1[0].Proveedor;
                        this.concepto = response.body.data1[0].Concepto;
                        this.baseP = response.body.data1[0].BaseP;
                        this.tarifa = response.body.data1[0].Tarifa;
                        this.TOT_monto = response.body.data1[0].TOT_Monto;
                        this.Valor_letra = response.body.data1[0].Valor_letra;
                        this.tables = response.body.data2;
                        this.state= false;
                    })
                    .catch((err) =>{
                        console.log(err);
                    });
            },

            toPdf(){
                let pdfName = "RET-"+this.nit+"-"+this.ano;
                html2canvas(this.$refs["capture"]).then(function(canvas) {
                    var imgData = canvas.toDataURL('image/png');              
                    var doc = new jsPDF('p', 'mm');
                    doc.addImage(imgData, 'PNG', 20, 10);
                    doc.save(pdfName+'.pdf');
                });
            },
            
            

            created: function()
            {
                //this.pendingTask()
                
            }

        }
    }


</script>