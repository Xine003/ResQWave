# Backend Process

**1. Register Admin**
URL:
```http://localhost:5000/register```

Postman: 
```{
  "name": "ResQWave",
  "password": "ResQWave"
}
```

**2. Admin Login**
URL:
```http://localhost:5000/admin/login```
Postman: 
```
{
  "username": "ResQWave",
  "password": "ResQWave"
}
```
**3. Get the Token and add it to the Header**
```
Authorization: Bearer <Token>
```

**4. Create Terminal**
- No Body
URL:
```http://localhost:5000/terminal```

**5. Create Community Group**
URL: 
```http://localhost:5000/communitygroup```
Postman: 
```
{
    "terminalID": "RESQWAVE001",
    "communityGroupName": "PAMAKAI 3 Community",
    "noOfIndividuals": 10,
    "noOfFamilies": 2,
    "noOfPWD": 1,
    "noOfPregnantWomen": 1,
    "noOfSeniors": 1,
    "noOfKids": 4,
    "otherInformation": "Always Flooding",
    "coordinates": 12.213123
}
```

**6. Create Focal Person** 
URL: 
```http://localhost:5000/focalperson```
Postman:
```
{
    "communityGroupID": "COMGROUP001",
    "name": "ResQWave",
    "contactNumber": "012345678910",
    "address": "Paraiso Road ",
    "alternativeFP": "Alt ResQWave",
    "alternativeFPContactNumber": "11234568910"
}
```

**7. You can now Login as a Focal Person after Creating Focal Person**
URL: 
```http://localhost:5000/focal/login```
Postman:
```
{
    "id": "FOCALP001",
    "password": "FOCALP001"
}
```
**8. Only Admin can access the Create Dispatcher**
URL:
```http://localhost:5000/dispatcher```
Postman:
```
{
    "name": "ResQWave",
    "email": "resqwave@gmail.com",
    "contactNumber": "012345678918"
}
```

**9. Login as Dispatcher**
URL: 
```http://localhost:5000/dispatcher/login```
Postman: 
```
{
  "id": "DSP001",
  "password": "DSP001"
}
```
