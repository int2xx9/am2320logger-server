require 'json'
require 'rubygems'
require 'bundler/setup'
require 'sinatra'
require 'sqlite3'
require 'erubis'

MaxPageItem=100

$db = SQLite3::Database.new("sensor.sqlite3")

get '/' do
  erb :index
end

get '/log' do
  page = 1
  if params[:page] && params[:page] =~ /\A\d+\z/
    page = params[:page].to_i
    page = 1 if page < 1
  end

  erb :log, locals: {
    page: page,
    recordCount: $db.query("select count(*) as count from sensor").next[0],
    records: $db.query("select * from sensor order by created_at desc limit #{MaxPageItem} offset #{(page-1)*MaxPageItem}")
  }
end

get '/sensor.json' do
  halt 400 if params[:count] !~ /\A\d+\z/
  count = params[:count].to_i || 60
  res = $db.query("select * from sensor order by created_at desc limit #{count}")
  content_type :json
  res.to_a
     .reverse
     .map{|x| {time: x[3], humidity: x[1], temperature: x[2]}}
     .to_json
end

post '/update' do
  temperature = params[:temperature]
  humidity = params[:humidity]
  halt 400 if temperature !~ /\A\d+?(\.\d+?)?\z/
  halt 400 if humidity !~ /\A\d+?(\.\d+?)?\z/
  $db.execute("insert into sensor (humidity, temperature) values (?, ?)",
              humidity, temperature)
  ""
end

