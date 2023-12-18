const expressModule = require("express");
const app = expressModule();
app.use(expressModule.json());
const cors = require("cors");
app.use(cors());

require("./DB/connection");

const stripe = require("stripe")(
  "xxxx"
);

// app.use(express.static("public"));
// app.use(express.json());

const calculateOrderAmount = (items) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client
  return 1400;
};
app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "eur",
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

const User = require("./Models/User");
const UserModel = User.UserModel;
const Doctor = require("./Models/Doctor");
const DoctorModel = Doctor.DoctorModel;
const Patient = require("./Models/Patient");
const PatientModel = Patient.PatientModel;
const Lab = require("./Models/Lab");
const LabModel = Lab.LabModel;
const Review = require("./Models/Review");
const ReviewModel = Review.ReviewModel;
const Appointment = require("./Models/Appointment");
const AppointmentModel = Appointment.AppointmentModel;
const Test = require("./Models/Test");
const TestModel = Test.TestModel;
const Admin = require("./Models/Admin");
const AdminModel = Admin.AdminModel;
const TimeSlot = require("./Models/TimeSlots");
const TimeSlotModel = TimeSlot.TimeSlotModel;
const Docreview = require("./Models/Docreview");
const DocReviewModel = Docreview.DocReviewModel;
const Result = require("./Models/Result");
const { default: Stripe } = require("stripe");
const ResultModel = Result.ResultModel;

app.get("/", (req, res) => {
  res.send("hello world! from server");
});

app.post("/signup", async (req, res) => {
  try {
    const { email, password, name, contact, type } = req.query;
    if (!email || !password || !name || !contact || !type) {
      res.send("fill the form");
    }
    var UserExist = await UserModel.findOne({ email: email });
    if (UserExist) {
      res.send("User already registered!!");
    } else {
      const newUser = new UserModel({
        email: email,
        password: password,
        name: name,
        contact: contact,
        type: type,
      });
      await newUser.save();
      address = " ";
      dob = " ";
      if (type == "doctor") {
        const newDoctor = new DoctorModel({
          email: email,
          address: address,
          fee: "",
          qual: "",
          spec: "",
          stat: "",
          reg: "",
        });
        await newDoctor.save();
      } else if (type == "patient") {
        const newPatient = new PatientModel({ email: email, DOB: dob });
        await newPatient.save();
      } else if (type == "laboratory") {
        const newLab = new LabModel({ email: email, address: address });
        await newLab.save();
      }
      res.send("added");
    }
  } catch (err) {
    res.send("error");
  }
});

app.post("/signin", async (req, res) => {
  try {
    const email = req.query.username;
    const password = req.query.password;
    if ((!email, !password)) {
      res.send("fill form");
    } else {
      const UserLogin = await UserModel.findOne({ email: email });
      if (UserLogin) {
        if (password == UserLogin.password) {
          res.send(UserLogin.type);
        } else {
          res.send("invalid credentials");
        }
      } else {
        res.send("invalid credentials");
      }
    }
  } catch (err) {
    res.send({ error: err });
  }
});

app.get("/viewdetails", async (req, res) => {
  //recieves a json object {email: 'email'}
  try {
    const email = req.query.email;
    const user = await UserModel.findOne({ email: email });
    if (user.type == "doctor") {
      const doc = await DoctorModel.findOne({ email: email });
      obj = {
        email: user.email,
        name: user.name,
        contact: user.contact,
        address: doc.address,
        fee: doc.fee,
        qual: doc.qual,
        spec: doc.spec,
        stat: doc.stat,
        reg: doc.reg,
      };
      res.send(obj);
    } else if (user.type == "patient") {
      const pat = await PatientModel.findOne({ email: email });
      obj = {
        email: user.email,
        name: user.name,
        contact: user.contact,
        dob: pat.DOB,
      };
      res.send(obj);
    } else if (user.type == "laboratory") {
      const lab = await LabModel.findOne({ email: email });
      const revs = await ReviewModel.find();
      const this_revs = revs.filter((r) => {
        return r.Lab == email;
      });
      var sat = 0;
      if (this_revs) {
        for (var i = 0; i < this_revs.length; i++) {
          sat = sat + parseInt(this_revs[i].Rating);
        }
        sat = sat / this_revs.length;
        sat = sat / 5;
        sat = sat * 100;
      }

      obj = {
        email: user.email,
        name: user.name,
        contact: user.contact,
        address: lab.address,
        satisfaction: sat,
        rev_count: this_revs.length,
      };
      res.send(obj);
    } else if (user.type == "admin") {
      const adm = await AdminModel.findOne({ email: email });
      obj = {
        email: user.email,
        name: user.name,
        contact: user.contact,
        dob: adm.DOB,
      };
      res.send(obj);
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/deleteuser", async (req, res) => {
  //recieves a json object {email: 'email'}
  try {
    const email = req.query.email;
    const user = await UserModel.findOne({ email: email });
    if (user) {
      if (user.type == "doctor") {
        const delete_ = await DoctorModel.deleteOne({ email: email });
        const app_ = await AppointmentModel.findOne({ Doctor: email });
        if (app_) {
          delete_ = await AppointmentModel.deleteMany({ Doctor: email });
        }
      } else if (user.type == "patient") {
        const delete_ = await PatientModel.deleteOne({ email: email });
        const app_ = await AppointmentModel.findOne({ Patient: email });
        if (app_) {
          delete_ = await AppointmentModel.deleteMany({ Patient: email });
        }
      } else if (user.type == "laboratory") {
        const delete_ = await LabModel.deleteOne({ email: email });
        const testt = await TestModel.findOne({ Lab: email });
        if (testt) {
          delete_ = await TestModel.deleteMany({ Lab: email });
        }
      }
      const delete_ = await UserModel.deleteOne({ email: email });
      res.send("deleted");
    } else {
      res.send("invalid");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/resetpassword", async (req, res) => {
  //recieves a json object {email: 'email', oldpassword: 'old', newpassword: 'new'}
  try {
    const email = req.query.email;
    const user = await UserModel.findOne({ email: email });
    if (
      user &&
      user.password == req.query.oldpassword &&
      req.query.newpassword != ""
    ) {
      const filter = { email: email };
      await UserModel.updateOne(filter, { password: req.query.newpassword });
      res.send("changed");
    } else {
      res.send("you have made an invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/updateprofile", async (req, res) => {
  // {email, name, contact, address}
  try {
    const user_ = await UserModel.findOne({ email: req.query.email });
    if (user_) {
      const filter = { email: req.query.email };
      await UserModel.updateOne(filter, {
        contact: req.query.contact,
      });
      await UserModel.updateOne(filter, {
        name: req.query.name,
      });
      if (user_.type == "doctor") {
        await DoctorModel.updateOne(filter, {
          address: req.query.address,
        });
        res.send("done");
      } else if (user_.type == "laboratory") {
        await LabModel.updateOne(filter, {
          address: req.query.address,
        });
        res.send("done");
      } else {
        res.send("invalid request");
      }
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/updateprofiledoc", async (req, res) => {
  // {email, fee, qual,address,country, spec,  year, RegID}
  try {
    const user_ = await UserModel.findOne({ email: req.query.email });
    if (user_) {
      const doc = await DoctorModel.findOne({ email: req.query.email });
      if (doc) {
        const filter = { email: req.query.email };
        await DoctorModel.updateOne(filter, { fee: req.query.fee });
        await DoctorModel.updateOne(filter, { qual: req.query.qual });
        await DoctorModel.updateOne(filter, { address: req.query.address });
        await DoctorModel.updateOne(filter, { reg: req.query.reg });
        await DoctorModel.updateOne(filter, {
          spec:
            req.query.spec +
            " (" +
            req.query.country +
            " " +
            req.query.year +
            " )",
        });
        await DoctorModel.updateOne(filter, { stat: "active" });
        res.send("done");
      }
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/editprofile", async (req, res) => {
  // {email, name, contact, dob}
  try {
    const user_ = await UserModel.findOne({ email: req.query.email });
    if (user_) {
      const filter = { email: req.query.email };
      await UserModel.updateOne(filter, {
        name: req.query.name,
        contact: req.query.contact,
      });
      if (user_.type == "patient") {
        await PatientModel.updateOne(filter, {
          DOB: req.query.dob,
        });
        res.send("done");
      } else if (user_.type == "admin") {
        await AdminModel.updateOne(filter, {
          DOB: req.query.dob,
        });
        res.send("done");
      } else {
        res.send("invalid request");
      }
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/adddocreview", async (req, res) => {
  try {
    const app_ = await AppointmentModel.findOne({ ID_: req.query.ID_ });
    if (app_) {
      if (app_.Doctor == req.query.Demail) {
        const newReview = new DocReviewModel({
          AppointID: req.query.ID_,
          Docemail: req.query.Demail,
          Patient: req.query.Pname,
          Doctor: req.query.Dname,
          Rating: req.query.Rating,
          Review: req.query.Review,
        });
        await newReview.save();
        res.send("added");
      } else {
        res.send("invalid");
      }
    } else {
      res.send("invalid appointment");
    }
  } catch (err) {
    res.send("error");
  }
});

app.post("/addreview", async (req, res) => {
  // json object {patient, lab, rating, review}
  try {
    const pat = req.query.Patient;
    const lab = req.query.Lab;
    const vp = await UserModel.findOne({ email: pat });
    const vl = await LabModel.findOne({ email: lab });
    if (vp && vl) {
      const rev = req.query;
      const newReview = new ReviewModel({
        Patient: vp.name,
        Lab: lab,
        Rating: req.query.Rating,
        Review: req.query.Review,
      });
      await newReview.save();
      res.send("added");
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.get("/getdocreviews", async (req, res) => {
  // json obj {docemail: string}
  try {
    const revs = await DocReviewModel.find();
    const doc_revs = revs.filter((r) => {
      return r.Docemail == req.query.docemail;
    });
    if (doc_revs) {
      res.send(doc_revs);
    }
  } catch (err) {
    res.send("error");
  }
});
// app.get("/getdocdetail", async (req, res) => {
//   // json obj {docemail: string}
//   try {
//     const docs = await DoctorModel.find();
//     const doctor = docs.filter((d) => {
//       return d.email == req.query.docemail;
//     });
//     console.log(doctor);
//     res.send(doctor);
//   } catch (err) {
//     res.send("error");
//   }
// });

app.get("/getappointreview", async (req, res) => {
  // {id_ : id of appointment}
  try {
    const rev = await DocReviewModel.findOne({ AppointID: req.query.id_ });

    if (rev) {
      res.send(rev);
    } else {
      res.send("invalid");
    }
  } catch (err) {
    res.send("error");
  }
});

app.get("/seereviews", async (req, res) => {
  //json obj that contains email of lab
  try {
    const email = req.query.email;
    const Labdetails = await ReviewModel.find();
    const revs = Labdetails.filter((lab) => {
      return lab.Lab == email;
    });
    if (revs) {
      res.send(revs);
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/fixappointment", async (req, res) => {
  //json obj {Doc, Pat, Date);
  try {
    const input_date = req.query.Date.split("-");
    const d = new Date();
    var yy = d.getFullYear();
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    if (yy > input_date[0]) {
      res.send("enter new date");
    } else if (mm > input_date[1] && yy >= input_date[0]) {
      res.send("enter new date");
    } else if (
      mm >= input_date[1] &&
      yy >= input_date[0] &&
      dd >= input_date[2]
    ) {
      res.send("enter new date");
    } else {
      const Doc = await UserModel.findOne({ email: req.query.Doc });
      const Pat = await UserModel.findOne({ email: req.query.Pat });
      if (Doc && Pat) {
        const eapps = await AppointmentModel.find();
        const docday = eapps.find((ee) => {
          return (
            ee.Doctor == req.query.Doc &&
            ee.Date == req.query.Date &&
            ee.Slot == req.query.Slot
          );
        });
        if (docday) {
          res.send("Doctor not available");
        } else {
          const existingapps = await AppointmentModel.find();
          var id_ = 1;
          if (existingapps) {
            id_ = existingapps.length + 1;
          }
          id_ = id_.toString();
          const newApp = new AppointmentModel({
            ID_: id_,
            Doctor: req.query.Doc,
            Patient: req.query.Pat,
            Dname: Doc.name,
            Pname: Pat.name,
            Date: req.query.Date,
            Slot: req.query.Slot,
            Status: "pending",
          });
          await newApp.save();
          res.send("added");
        }
      } else {
        res.send("invalid request");
      }
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/completeappoint", async (req, res) => {
  // obj{id_: id}
  try {
    const id = req.query.id_;
    const filter = { ID_: id };
    await AppointmentModel.updateOne(filter, { Status: "completed" });
    res.send("done");
  } catch (err) {
    res.send("error");
  }
});

app.post("/approveappoint", async (req, res) => {
  // obj{id_: id}
  try {
    const id = req.query.id_;
    const filter = { ID_: id };
    await AppointmentModel.updateOne(filter, { Status: "approved" });
    res.send("done");
  } catch (err) {
    res.send("error");
  }
});

app.post("/cancelappoint", async (req, res) => {
  //{id_:AppointmentID}
  try {
    const id = req.query.id_;
    const filter = { ID_: id };
    await AppointmentModel.updateOne(filter, { Status: "cancelled" });
    res.send("done");
  } catch (err) {
    res.send("ERROR");
  }
});

app.get("/viewappointments", async (req, res) => {
  try {
    const apps_ = await AppointmentModel.find();
    if (apps_) {
      res.send(apps_);
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/addtest", async (req, res) => {
  //json obj {Lab,TestName,Price}
  try {
    const lab = req.query.Lab;
    const name = req.query.TestName;
    const price = req.query.Price;
    if (!lab || !name || !price) {
      res.send("fill form");
    }
    const Labtest = await TestModel.findOne({
      Lab: req.query.Lab,
      TestName: req.query.TestName,
    });
    if (Labtest) {
      res.send("Test already exists");
    } else {
      const test = req.query;
      const newtest = new TestModel(test);
      await newtest.save();
      res.send("success");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.get("/viewtests", (req, res) => {
  try {
    var result = TestModel.find()
      .then((temp) => {
        res.send(temp);
      })
      .catch((err) => {
        return err;
      });
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/deletetest", async (req, res) => {
  //json obj {Lab,TestName}
  try {
    const Labtest = await TestModel.findOne({
      Lab_: req.query.Lab,
      TestName: req.query.TestName,
    });
    if (Labtest) {
      const delete_ = await TestModel.deleteOne({
        Lab: req.query.Lab,
        TestName: req.query.TestName,
      });
      res.send("success");
    } else {
      res.send("test doesnot exist");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/edittest", async (req, res) => {
  //json obj {Lab,TestName,Price, oldname}
  //Lab: email of lab
  try {
    const Labtest = await TestModel.findOne({
      Lab_: req.query.Lab,
      TestName: req.query.oldname,
    });
    if (Labtest) {
      const delete_ = await TestModel.deleteOne({
        Lab: req.query.Lab,
        TestName: req.query.oldname,
      });
      const test = {
        Lab: req.query.Lab,
        TestName: req.query.TestName,
        Price: req.query.Price,
      };
      const newtest = new TestModel(test);
      await newtest.save();
      res.send("success");
    } else {
      res.send("Inavlid");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/addpromotion", async (req, res) => {
  // recieves json obj {Lab: labemail, TestName: test}
  try {
    const lab_ = req.query.Lab;
    const name_ = req.query.TestName;
    const Test_ = await TestModel.findOne({
      Lab: lab_,
      TestName: name_,
    });
    if (Test_) {
      const filter = { Lab: lab_, TestName: name_ };
      const newP = Test_.Price * 0.8;
      await TestModel.updateOne(filter, { Price: newP });
      res.send("added");
    } else {
      res.send("Test doesnot exists");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.get("/seedocs", async (req, res) => {
  const users = await UserModel.find();
  const docs = users.filter((u) => {
    return u.type == "doctor";
  });
  const docdata = await DoctorModel.find();
  const doc_revs = await DocReviewModel.find();
  data = [];
  for (var i = 0; i < docs.length; i++) {
    rat = 0;
    docrev = doc_revs.filter((d) => {
      return d.Docemail == docs[i].email;
    });
    for (var z = 0; z < docrev.length; z++) {
      rat = rat + docrev[z].Rating;
    }

    rat = rat / docrev.length;
    rat = rat / 5;
    rat = rat * 100;
    obj = {
      name: docs[i].name,
      email: docs[i].email,
      contact: docs[i].contact,
      address: docdata[i].address,
      fee: docdata[i].fee,
      qual: docdata[i].qual,
      spec: docdata[i].spec,
      stat: docdata[i].stat,
      percent_rating: rat,
    };
    data.push(obj);
  }
  res.send(data);
});
app.get("/seepats", async (req, res) => {
  const users = await UserModel.find();
  const pats = users.filter((u) => {
    return u.type == "patient";
  });
  const patdata = await PatientModel.find();
  data = [];
  for (var i = 0; i < pats.length; i++) {
    obj = {
      name: pats[i].name,
      email: pats[i].email,
      contact: pats[i].contact,
      dob: patdata[i].DOB,
    };
    data.push(obj);
  }
  res.send(data);
});

app.get("/seelabs", async (req, res) => {
  const users = await UserModel.find();
  const labs = users.filter((u) => {
    return u.type == "laboratory";
  });
  const labdata = await LabModel.find();
  data = [];
  for (var i = 0; i < labs.length; i++) {
    obj = {
      name: labs[i].name,
      email: labs[i].email,
      contact: labs[i].contact,
      address: labdata[i].address,
    };
    data.push(obj);
  }
  res.send(data);
});

app.post("/addslot", async (req, res) => {
  // email, slots(json array)
  try {
    for (var i = 0; i < req.query.slots.length; i++) {
      const daytime = req.query.slots[i].split(",");
      const ts = await TimeSlotModel.findOne({
        email: req.query.email,
        slot: daytime[1],
        day: daytime[0],
      });
      if (ts) {
        //console.log("already exists");
      } else {
        const newslot = {
          email: req.query.email,
          slot: daytime[1],
          day: daytime[0],
        };
        const slot = TimeSlotModel(newslot);
        await slot.save();
      }
    }
    res.send("added");
  } catch (err) {
    res.send("ERROR");
  }
});

app.get("/getslots", async (req, res) => {
  // email of doctor, day of appointment, date
  try {
    const input_date = req.query.date.split("-");
    const d = new Date();
    var yy = d.getFullYear();
    var mm = d.getMonth() + 1;
    var dd = d.getDate();
    if (yy > input_date[0]) {
      res.send("enter new date");
    } else if (mm > input_date[1] && yy >= input_date[0]) {
      res.send("enter new date");
    } else if (
      mm >= input_date[1] &&
      yy >= input_date[0] &&
      dd >= input_date[2]
    ) {
      res.send("enter new date");
    } else {
      const slots = await TimeSlotModel.find();
      const doc_slots = slots.filter((s) => {
        return s.email == req.query.email && s.day == req.query.day;
      });
      available_slots = [];
      for (var i = 0; i < doc_slots.length; i++) {
        const docsapp = await AppointmentModel.findOne({
          Doctor: req.query.email,
          Date: req.query.date,
          Slot: doc_slots[i].slot,
        });
        if (docsapp) {
        } else {
          available_slots.push(doc_slots[i]);
        }
      }
      res.send(available_slots);
    }
  } catch (err) {
    res.send("ERROR");
  }
});
app.get("/getslotsdoctor", async (req, res) => {
  // email of doctor
  try {
    const slots = await TimeSlotModel.find();
    const doc_slots = slots.filter((s) => {
      return s.email == req.query.email;
    });
    res.send(doc_slots);
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/deleteslot", async (req, res) => {
  // email, slot, day
  try {
    const slot = await TimeSlotModel.findOne({
      email: req.query.email,
      slot: req.query.slot,
      day: req.query.day,
    });
    if (slot) {
      const delete_ = await TimeSlotModel.deleteOne({
        email: req.query.email,
        slot: req.query.slot,
        day: req.query.day,
      });
      res.send("deleted");
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.post("/saveresult", async (req, res) => {
  // json obj {appID_: String, result: String}
  try {
    const app = await AppointmentModel.findOne({ ID_: req.body.appID_ });
    if (app) {
      const newresult = {
        appID_: req.query.appID_,
        result: req.query.result,
        TestName: req.query.testName,
        LabEmail: req.query.LabEmail,
        Status: req.query.Status,
      };
      const result_ = ResultModel(newresult);
      await result_.save();
      res.send("success");
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("error");
  }
});

app.get("/getresult", async (req, res) => {
  // json obj {appID_ : string}
  try {
    const res = await ResultModel.findOne({ appID_: req.query.appID_ });
    if (res) {
      res.send(res);
    } else {
      res.send("invalid request");
    }
  } catch (err) {
    res.send("error");
  }
});

app.get("/getalltests", async (req, res) => {
  try {
    alltests = [];
    const tests = await TestModel.find();
    tests.map((t) => {
      alltests.push({
        Lab: t.Lab,
        TestName: t.TestName,
        Price: t.Price,
      });
    });
    res.send(alltests);
  } catch (err) {
    res.send("error");
  }
});

app.get("/labname", async (req, res) => {
  // json obj {email: labemail}
  try {
    const lab = await UserModel.findOne({ email: req.query.email });
    if (lab) {
      res.send(lab.name);
    } else {
      res.send("error");
    }
  } catch (err) {
    res.send("error");
  }
});

app.post("/savehistory", async (req, res) => {
  /*
  json obj
  appID_: String,
  result: String,
  LabEmail: String,
  TestName: String,*/
  try {
    const result = {
      appID_: req.query.appID_,
      result: req.query.result,
      LabEmail: req.query.LabEmail,
      TestName: req.query.TestName,
      Status: req.query.Status,
    };
    const new_result = ResultModel(result);
    await new_result.save();
    res.send("success");
  } catch (err) {
    res.send("error");
  }
});

const fetch_history = async (appID) => {
  const history = await ResultModel.findOne({ appID_: appID });
  return history;
};

app.get("/patienthistory", async (req, res) => {
  // json obj {email: patient email}
  try {
    const apps = await AppointmentModel.find();
    const pat_apps = apps.filter((a) => {
      return a.Patient == req.query.email;
    });
    history_pat = [];
    for (var i = 0; i < pat_apps.length; i++) {
      obj = await fetch_history(pat_apps[i].ID_);
      if (obj) {
        history_pat.push(obj);
      }
    }

    res.send(history_pat);
  } catch (err) {
    res.send("error");
  }
});

// API For Payment
// app.post("/payment", async (req, res) => {
//   let { amount, id } = req.body;
//   try {
//     const payment = await stripe.paymentIntents.create({
//       amount,
//       currency: "USD",
//       description: "Spatula company",
//       payment_method: id,
//       confirm: true,
//     });
//     console.log("payment", payment);
//     res.json({ message: "payment successful", success: true });
//   } catch (err) {
//     console.log("Error", err.type);
//     res.json({ message: "payment failed", success: false });
//   }
// });
app.post("/payment/create", async (req, res) => {
  console.log("total:", req.body.amount);
  const payment = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "USD",
  });
  res.status(201).send({
    clientSecret: payment.client_secret,
  });
});

app.post("/fixlabappoint", async (req, res) => {
  try {
    const filter = { appID_: req.query.appID_ };
    await ResultModel.updateOne(filter, { Status: "InProgress" });
    res.send("done");
  } catch (err) {
    res.send("error");
  }
});

app.post("/completelabappoint", async (req, res) => {
  try {
    const filter = { appID_: req.query.appID_ };
    await ResultModel.updateOne(filter, { Status: "Completed" });
    res.send("done");
  } catch (err) {
    res.send("error");
  }
});

app.get("/patientappointlab", async (req, res) => {
  try {
    const appoints = await ResultModel.find();
    const apps = appoints.filter((a) => {
      return a.LabEmail == req.query.email;
    });
    const myapps = apps.filter((a) => {
      return a.Status == "InProgress" || a.Status == "Completed";
    });
    if (myapps) {
      res.send(myapps);
    } else {
      res.send("no appointment");
    }
  } catch (err) {
    res.send("ERROR");
  }
});

app.listen(4000, () => {
  console.log("server is listening");
});
