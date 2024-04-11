


var url = window.location.origin + "/game/history"
var gamehistory = "";
datatableDraw(url);
function datatableDraw(url) {
    gamehistory = $('#gamehistory').DataTable({
        "language": {
            searchPlaceholder: "Search Game"
        },
        "processing": true,
        "serverSide": true,
        "destroy": true,
        "responsive": true,
        "searching": true,
        "ordering": true,
        "autoWidth": false,
        "lengthMenu": [10, 25, 50, 100, 200, 500, 1000],
        "pageLength": 10,
        "order": [[0, "desc"]],
        "fixedColumns": true,
        "fixedHeader": {
            header: true
        },
        "columnDefs": [
            {
                "targets": [4],
                "orderable": false,
                "searching": false,
            },
            {
                "targets": [1],
                "orderable": true,
                "searching": false,
            },
            {
                "targets": [7],
                "orderable": false,
                "searching": false,
                "width": 50
            },
            {
                "targets": [8],
                "orderable": false,
                "searching": false,
                "width": 50
            }
        ],
        "ajax": {
            url: url,
            "dataSrc": function (successData) {
                return successData.data;
            }
        },
        "columns": [
            { "data": "game_number" },
            {
                "data": "created_at", "render": (data, type, row) => {
                    return moment(row.created_at).utc().format("DD-MM-YYYY hh:mm");
                }
            },
            { "data": "stopped_on_number" },
            // { "data": "game_hash" },
            { "data": "bet_amount" },
            {
                "data": "game_status", render: (data, type, row) => {
                    if (row.game_status == "completed") {
                        return `<td><span class="text-success">Completed</span></td>`;
                    } else {
                        return `<td><span class="text-info">Pending</span></td>`;
                    }
                }
            },
            {
                "data": "totalWinAmountShow"
            },
            {
                "data": "view", "render": (data, type, row) => {
                    return `<button type="button" class="btn btn-success btn-sm" onClick="showhistory(this)" data-index="` + row.id + `" title="View History" style="margin-left:5px;"><i class="fa fa-eye"></i></button>`;
                }
            },
            { "data": "admin_commission" },
            {
                "data": "admin_commission_price", "render": (data, type, row) => {
                    return row.admin_commission_price + " " + row["currencyDetails.currency_name"]
                }
            }
        ]
    });
}
// $(document.body).click(".showHistory", (e) => {
// 	$("#mediumModal").modal("show");
// });	

function showhistory(e) {
    var headerId = $(e).data("index");
    $("#mediumModal").modal("show");
    $('#spinHistory').DataTable().destroy();
    historyTable(headerId);

}
var spinHistory = "";
var chipsAmount = 0;
function historyTable(index) {
    var dUrl = window.location.origin + "/game/gethistory/" + index;
    spinHistory = $('#spinHistory').DataTable({
        "processing": true,
        "serverSide": true,
        "destroy": true,
        "responsive": true,
        "searching": false,
        "ordering": false,
        "autoWidth": false,
        "lengthMenu": [10, 25, 50, 100, 200, 500, 1000],
        "pageLength": 10,
        "fixedHeader": {
            header: true
        },
        "columnDefs": [
            {
                "targets": [0],
                "orderable": false,
                "searching": false,
            }
        ],
        "ajax": {
            url: dUrl,
            "dataSrc": function (successData) {
                chipsAmount = successData.chispAmount
                return successData.data;
            }
        },
        "columns": [
            {
                "data": "srno", "render": (data, type, full, meta) => {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            {
                "data": "selectedNumber", render: (data, type, row) => {
                    if (row.isSector == "0") {
                        return row.selectedNumber;
                    } else {
                        if (row.sectorNo == "1") {
                            return "2 to 1";
                        } else if (row.sectorNo == "2") {
                            return "2 to 1";
                        } else if (row.sectorNo == "3") {
                            return "2 to 1";
                        } else if (row.sectorNo == "4") {
                            return "1st 12";
                        } else if (row.sectorNo == "5") {
                            return "2nd 12";
                        } else if (row.sectorNo == "6") {
                            return "3rd 12";
                        } else if (row.sectorNo == "7") {
                            return "1 to  18";
                        } else if (row.sectorNo == "8") {
                            return "Even";
                        } else if (row.sectorNo == "9") {
                            return "Red";
                        } else if (row.sectorNo == "10") {
                            return "Black";
                        } else if (row.sectorNo == "11") {
                            return "ODD";
                        } else if (row.sectorNo == "12") {
                            return "19 to 36";
                        }
                    }
                }
            },
            { "data": "bet_amount" },
            {
                "data": "is_won", render: (data, type, row) => {
                    if (row.is_won == "yes") {
                        return `<td><span class="text-success">Won</span></td>`;
                    } else if (row.is_won == "no") {
                        return `<td><span class="text-danger">Lost</span></td>`;
                    } else {
                        return `<td><span class="text-info">Pending</span></td>`;
                    }
                }
            },
            {
                "data": "winning_amount", render: (data, type, row) => {
                    return parseFloat(parseFloat(row.winning_amount) * parseFloat(chipsAmount)).toFixed(8)
                }
            }
        ]
    });
}
$('#mediumModal').on('hidden.bs.modal', function () {
    $('#spinHistory').DataTable().destroy();
})


/*Withdraw*/
var withdrawTable = "";
historyWithdrawTable();

function historyWithdrawTable() {
    var dUrl = window.location.origin + "/withdraw/getwithdrawlist";
    withdrawTable = $('#withdrawTable').DataTable({
        "processing": true,
        "serverSide": true,
        "destroy": true,
        "responsive": true,
        "searching": true,
        "ordering": false,
        "autoWidth": false,
        "lengthMenu": [10, 25, 50, 100, 200, 500, 1000],
        "pageLength": 10,
        "fixedHeader": {
            header: true
        },
        "columnDefs": [
            {
                "targets": [0],
                "orderable": false,
                "searching": false,
            }
        ],
        "ajax": {
            url: dUrl,
            "dataSrc": function (successData) {
                return successData.data;
            }
        },
        "columns": [
            {
                "data": "srno", "render": (data, type, full, meta) => {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            { "data": "transaction_id" },
            { "data": "withdrawAmout" },
            {
                "data": "coin_image", render: (data, type, row) => {
                    return `<img src="frontend/img/` + row.coin_type + `.svg">`
                }
            },
            {
                "data": "status", render: (data, type, row) => {
                    if (row.status == "success") {
                        return `<td><span class="text-success">Success</span></td>`;
                    } else if (row.is_won == "failed") {
                        return `<td><span class="text-danger">Failed</span></td>`;
                    } else {
                        return `<td><span class="text-info">Pending</span></td>`;
                    }
                }
            },
            {
                "data": "transaction_date", render: (data, type, row) => {
                    return moment(row.transaction_date).utc().format("DD-MM-YYYY");
                }
            }
        ]
    });
}


/*Deposit */
var bet_history_table = "";
function historyDepositTable() {
    var dUrl = window.location.origin + "/deposit/getdepositelist";
    bet_history_table = $('#bet_history_table').DataTable({
        "processing": true,
        "serverSide": true,
        "destroy": true,
        "responsive": true,
        "searching": true,
        "ordering": false,
        "autoWidth": false,
        "lengthMenu": [10, 25, 50, 100, 200, 500, 1000],
        "pageLength": 10,
        "fixedHeader": {
            header: true
        },
        "columnDefs": [
            {
                "targets": [0],
                "orderable": false,
                "searching": false,
            }
        ],
        "ajax": {
            url: dUrl,
            "dataSrc": function (successData) {
                return successData.data;
            }
        },
        "columns": [
            {
                "data": "srno", "render": (data, type, full, meta) => {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }
            },
            { "data": "transaction_id" },
            { "data": "depositCoin" },
            {
                "data": "coin_image", render: (data, type, row) => {
                    return `<img src="frontend/img/` + row.coin_type + `.svg">`
                }
            },
            {
                "data": "status", render: (data, type, row) => {
                    if (row.status == "success") {
                        return `<td><span class="text-success">Success</span></td>`;
                    } else if (row.is_won == "failed") {
                        return `<td><span class="text-danger">Failed</span></td>`;
                    } else {
                        return `<td><span class="text-info">Pending</span></td>`;
                    }
                }
            },
            {
                "data": "transaction_date", "render": (data, type, row) => {
                    return moment(row.transaction_date).utc().format("DD-MM-YYYY");
                }
            }
        ]
    });
}
