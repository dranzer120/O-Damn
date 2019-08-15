from flask import Flask
from flask_sqlalchemy import SQLAlchemy

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

import pandas as pd

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///opioid_data.db'
db = SQLAlchemy(app)

Base = automap_base()
# reflect the tables
Base.prepare(db.engine, reflect=True)

print(Base.classes.keys())

Opioid = Base.classes.ConnecticutAccidentalDeath

stmt = db.session.query(Opioid).limit(10).statement
df = pd.read_sql_query(stmt, db.session.bind)

print(df)