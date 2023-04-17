const getLtik = () => {
  const searchParams = new URLSearchParams(window.location.search);
  const ltik = searchParams.get("ltik");
  if (!ltik) throw new Error("Missing lti key.");
  return ltik;
};

// get username
getData()

async function getData() {
  try {
    const b = {
      ltik: getLtik(),
    };
    const response = await fetch(`/info?ltik=${b.ltik}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    
    });
    if (!response.ok) {
      throw new Error("Network response was not OK");
    }
    const data = await response.json();
    const p = document.querySelector("h2");
    p.innerHTML = `Olá ${data.name} é com grande prazer que dou as boas vindas ao Escape Room Math Digger!`
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
  }
}

const createForm = async () => {
  const body = {
    ltik: getLtik(),
    title: $('input[name="resource"]:checked').val(),
  };
  $.post("/deeplink", body, function (form) {
    $("#resources").append(form);
  });
};

const getMembers = async () => {
  const body = {
    ltik: getLtik(),
  };
  $.post("/members", body, function (result) {
    var members = [];
    for (const x of result) {
      var name = x.name;
      var email = x.email;
      var roles = x.roles;
      var userId = x.user_id;
      members.push(userId);
      $("#members_table")
        .find("tbody")
        .append(
          "<tr><td>" +
            name +
            "</td><td>" +
            email +
            "</td><td>" +
            roles +
            "</td><td><input type='num' id='grade" +
            userId +
            "'> <br> <input type='button' value='Submit grade' id='" +
            userId +
            "' onclick=setGrade('" +
            userId +
            "')></td></tr>"
        );
    }
    showGrades(members);
  });
};

const showGrades = async (members) => {
  for (var member of members) {
    const body = {
      ltik: getLtik(),
      userId: member,
    };
    $.post("/getGrade", body, function (result) {
      console.log(result);
      var score = result.scores[0].resultScore;
      var user = result.scores[0].userId;
      $("#grade" + user).val(score);
    });
  }
};

const setGrade = async (userIdToken) => {
  const body = {
    ltik: getLtik(),
    grade: $("#grade" + userIdToken).val(),
    userId: userIdToken,
  };

  $.post("/lti-tool/grade", body, function (result) {
    alert("done");
    console.log(result);
  });
};
