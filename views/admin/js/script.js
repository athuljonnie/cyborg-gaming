// const charts = document.querySelectorAll(".chart");

// charts.forEach(function (chart) {
//   var ctx = chart.getContext("2d");
//   var myChart = new Chart(ctx, {
//     type: "doughnut",
//     data: {
//       labels: ["RazorPay", "COD"],
//       datasets: [{
//             data: [<%= razorpayTotalAmount %>, <%= codTotalAmount %>],
//             backgroundColor: ['#FF6384', '#36A2EB'], // Add color for the Wallet data point
//             hoverBackgroundColor: ['rgba(255, 99, 133, 0.5)', 'rgba(54, 163, 235, 0.5)'] // Add hover color for the Wallet data point
//           }]
//         },
//         options: {
//           responsive: true,
//           cutoutPercentage: 70, // Adjust the cutoutPercentage to control the size of the hole in the middle
//           legend: {
//             display: true,
//             position: 'bottom'
//           }
//         }
  
  
//   });
// });

// $(document).ready(function () {
//   $(".data-table").each(function (_, table) {
//     $(table).DataTable();
//   });
// });
