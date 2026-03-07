app.controller('dashboardController', function ($scope, medicineService, invoiceService) {

    var today = new Date();
    $scope.today = today;
    var todayStr = today.toISOString().split('T')[0];

    var weekDays = [];
    var weekLabels = [];
    for (var i = 6; i >= 0; i--) {
        var d = new Date(today);
        d.setDate(today.getDate() - i);
        weekDays.push(d.toISOString().split('T')[0]);
        weekLabels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    medicineService.getAllMedicines().then(function (res) {
        var medicines = res.data;

        $scope.lowStock = medicines.filter(function (m) {
            return m.stock <= 10 && new Date(m.expiry_date) >= today;
        }).length;

        $scope.expiredCount = medicines.filter(function (m) {
            return new Date(m.expiry_date) < today;
        }).length;
    });

    invoiceService.getAllInvoices().then(function (res) {
        var invoices = res.data;

        var todayInvoices = invoices.filter(function (inv) {
            return inv.created_at.split('T')[0] === todayStr;
        });

        $scope.todayInvoices = todayInvoices.length;

        $scope.todayRevenue = todayInvoices.reduce(function (sum, inv) {
            return sum + (inv.total_amount || 0);
        }, 0);

        var salesByDay = {};
        weekDays.forEach(function (d) { salesByDay[d] = 0; });

        invoices.forEach(function (inv) {
            var day = inv.created_at.split('T')[0];
            if (salesByDay.hasOwnProperty(day)) {
                salesByDay[day] += (inv.total_amount || 0);
            }
        });

        var ctx = document.getElementById('salesChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: weekLabels,
                datasets: [{
                    label: 'Revenue ($)',
                    data: weekDays.map(function (d) { return salesByDay[d]; }),
                    backgroundColor: 'rgba(79, 142, 247, 0.15)',
                    borderColor: '#4F8EF7',
                    borderWidth: 2,
                    borderRadius: 6,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, grid: { color: '#f0f0f0' } },
                    x: { grid: { display: false } }
                }
            }
        });
    });
});