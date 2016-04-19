document.addEventListener('DOMContentLoaded', function() {
  // onClick's logic below:
  $('#chooseFile').on('change', function(e) {
    let file = e.target.files[0];
    if (window.FileReader) {
      // FileReader is supported.
      // generate a new FileReader object
      let reader = new FileReader();

      reader.onload = function(event) {
        let csv = reader.result;
        let data = new CSV(csv, { header: true }).parse();
        displayCSVData(data);
      }
      // when the file is read it triggers the onload event above.
      reader.readAsText(file, 'UTF-8');
    }
  });

  let companies = [];
  let titles = [];
  function displayCSVData(data) {
    _.each(data,function(row){
      if(row.company) companies.push(row.company);
      if(row && row.title) titles.push(row.title);
      $("table tbody")
        .append($('<tr>')
          .append($('<td>')
            .text(row.company)
          )
        );
    });
    companies = _.uniq(companies);
  }

  function constructUrl(){
    titles = $("#companyTitle").val().split(",");
    titles = _.uniq(titles);
    let baseUrl = "https://www.linkedin.com/vsearch/p?titleScope=C&companyScope=C&"
    let companyUrl = "company="
    let titleUrl = "title=";
    _.each(companies,function(company, index){
      if(index === 0) companyUrl += company;
      else companyUrl += "%20OR%20" + company;
    });
    _.each(titles,function(title, index){
      if(index === 0) titleUrl += title;
      else titleUrl += "%20OR%20" + title;
    });
    return baseUrl + companyUrl + "&" + titleUrl;
  }

  $('#openLinkedIn').on('click', function(e) {
    var newURL = constructUrl();
    chrome.tabs.create({ url: newURL } );
  });

});
